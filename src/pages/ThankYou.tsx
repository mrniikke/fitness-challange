const ThankYou = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Thank You! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you for creating an account. You can close this window and go back to the app. 
          Hope this app will get you and your friends get motivated. You are awesome!
        </p>
      </div>
    </div>
  );
};

export default ThankYou;
