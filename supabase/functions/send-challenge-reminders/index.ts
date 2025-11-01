import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔔 Starting challenge reminder check...');
    
    // Get current UTC time
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();
    const today = now.toISOString().split('T')[0];
    
    console.log(`Current UTC time: ${currentHour}:${currentMinute}`);
    
    // Get all users with their timezones
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, timezone, display_name, username');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    console.log(`Found ${profiles?.length || 0} profiles`);
    
    let notificationsSent = 0;
    
    for (const profile of profiles || []) {
      try {
        // Calculate local time for user (simple offset calculation)
        // In production, you'd want a proper timezone library
        const timezoneOffset = getTimezoneOffset(profile.timezone || 'UTC');
        const localHour = (currentHour + timezoneOffset + 24) % 24;
        
        console.log(`User ${profile.user_id} local time: ${localHour}:${currentMinute} (timezone: ${profile.timezone})`);
        
        // Check if it's 8 PM (20:00) in user's local time (with 30 minute window)
        if (localHour === 20 && currentMinute < 30) {
          console.log(`✅ User ${profile.user_id} is at 8 PM, checking challenges...`);
          
          // Get all groups the user is a member of
          const { data: memberships } = await supabase
            .from('group_members')
            .select('group_id, groups(name)')
            .eq('user_id', profile.user_id);
          
          if (!memberships || memberships.length === 0) {
            console.log(`User ${profile.user_id} is not in any groups, skipping`);
            continue;
          }
          
          // Check each group for incomplete challenges
          for (const membership of memberships) {
            const groupId = membership.group_id;
            const groupName = (membership.groups as any)?.name || 'Your group';
            
            // Get today's active challenges for this group
            const { data: challenges } = await supabase
              .from('group_challenges')
              .select('id, goal_amount')
              .eq('group_id', groupId);
            
            if (!challenges || challenges.length === 0) {
              console.log(`No challenges in group ${groupId}`);
              continue;
            }
            
            // Check if user has completed any challenge today
            const { data: todayLog } = await supabase
              .from('pushup_logs')
              .select('id, pushups, completed_at, challenge_id')
              .eq('user_id', profile.user_id)
              .eq('group_id', groupId)
              .eq('log_date', today)
              .single();
            
            // Check if there are any incomplete challenges
            const hasIncompleteChallenge = challenges.some(challenge => {
              if (!todayLog) return true; // No log at all
              if (todayLog.challenge_id !== challenge.id) return true; // Different challenge
              if (!todayLog.completed_at) return true; // Not completed
              return false;
            });
            
            if (hasIncompleteChallenge) {
              console.log(`📢 Sending reminder to user ${profile.user_id} for group ${groupId}`);
              
              // Check if we already sent a notification today to avoid duplicates
              const { data: existingNotification } = await supabase
                .from('scheduled_notifications')
                .select('id')
                .eq('user_id', profile.user_id)
                .eq('group_id', groupId)
                .eq('notification_type', 'challenge_reminder')
                .gte('created_at', `${today}T00:00:00Z`)
                .single();
              
              if (!existingNotification) {
                // Get user's push tokens
                const { data: pushTokens } = await supabase
                  .from('user_push_tokens')
                  .select('player_id')
                  .eq('user_id', profile.user_id);

                const title = '💪 Challenge Reminder';
                const message = `Get up and be awesome. There is still time to complete your challenges in ${groupName}!`;
                
                // Send push notification via OneSignal if we have tokens
                if (pushTokens && pushTokens.length > 0) {
                  const playerIds = pushTokens.map(t => t.player_id);
                  
                  try {
                    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
                    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');
                    
                    if (!oneSignalAppId || !oneSignalApiKey) {
                      console.error('OneSignal credentials not configured');
                    } else {
                      const response = await fetch('https://onesignal.com/api/v1/notifications', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Basic ${oneSignalApiKey}`,
                        },
                        body: JSON.stringify({
                          app_id: oneSignalAppId,
                          include_player_ids: playerIds,
                          headings: { en: title },
                          contents: { en: message },
                          data: {
                            group_id: groupId,
                            notification_type: 'challenge_reminder'
                          }
                        }),
                      });
                      
                      if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`OneSignal API error: ${response.status} - ${errorText}`);
                      } else {
                        const result = await response.json();
                        console.log(`✅ Push notification sent to ${playerIds.length} device(s):`, result);
                      }
                    }
                  } catch (pushError) {
                    console.error('Error sending push notification:', pushError);
                  }
                }
                
                // Create in-app notification
                const { error: notifError } = await supabase
                  .from('scheduled_notifications')
                  .insert({
                    user_id: profile.user_id,
                    group_id: groupId,
                    title,
                    message,
                    notification_type: 'challenge_reminder',
                    read: false
                  });
                
                if (notifError) {
                  console.error(`Error creating notification for user ${profile.user_id}:`, notifError);
                } else {
                  notificationsSent++;
                  console.log(`✅ Notification sent to user ${profile.user_id}`);
                }
              } else {
                console.log(`Notification already sent today to user ${profile.user_id} for group ${groupId}`);
              }
            } else {
              console.log(`User ${profile.user_id} has completed challenges in group ${groupId}`);
            }
          }
        }
      } catch (err) {
        console.error(`Error processing user ${profile.user_id}:`, err);
      }
    }
    
    console.log(`🎉 Reminder check complete. Sent ${notificationsSent} notifications.`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent,
        timestamp: now.toISOString() 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in send-challenge-reminders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});

// Helper function to get timezone offset in hours
function getTimezoneOffset(timezone: string): number {
  const offsets: Record<string, number> = {
    'UTC': 0,
    'America/New_York': -5,
    'America/Chicago': -6,
    'America/Denver': -7,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
    'Europe/Paris': 1,
    'Europe/Berlin': 1,
    'Asia/Tokyo': 9,
    'Asia/Shanghai': 8,
    'Asia/Dubai': 4,
    'Australia/Sydney': 11,
    'Pacific/Auckland': 13,
  };
  
  return offsets[timezone] || 0;
}
