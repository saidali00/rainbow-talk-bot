import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    setSigningIn(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setSigningIn(false);
      toast({ title: "Sign in failed", description: String(result.error), variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/40 animate-fade-in">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Welcome to WadiAi</h1>
            <p className="text-sm text-muted-foreground max-w-xs">
              Sign in to unlock smart conversations, saved chats, and a personalized experience.
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={signingIn}
            className="group relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-card border-2 border-border hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {signingIn ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="font-medium text-foreground">
              {signingIn ? "Signing in..." : "Continue with Google"}
            </span>
          </button>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            By continuing, you agree to our terms and privacy policy.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by <span className="gradient-text font-bold">WadiAi</span> × <span className="font-bold">Xenonymous</span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
