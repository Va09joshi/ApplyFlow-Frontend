"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from "axios";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      router.push("/dashboard");
    }
  }, [accessToken, router]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || fallback;
    }
    return fallback;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      const response = await api.post("/api/v1/auth/login", data);
      
      const { accessToken, refreshToken, user } = response.data.data || response.data;
      
      if (accessToken) {
        setAuth(accessToken, refreshToken, user);
        toast.success("Successfully logged in!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to retrieve access token.");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Invalid credentials. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google credential not found. Please try again.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/api/v1/auth/google", {
        idToken: credentialResponse.credential,
      });
      const { accessToken, refreshToken, user } = response.data.data || response.data;
      if (accessToken) {
        setAuth(accessToken, refreshToken, user);
        toast.success("Successfully logged in with Google!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to retrieve access token.");
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Google Login failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-3 sm:p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 -z-10 w-80 h-80 sm:w-125 sm:h-125 bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-80 h-80 sm:w-125 sm:h-125 bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-6 sm:mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl sm:text-2xl tracking-tight">ApplyFlow <span className="text-primary">AI</span></span>
          </Link>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  className="bg-background/50" 
                  {...register("email")}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  className="bg-background/50" 
                  {...register("password")}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="w-full flex justify-center">
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                <div className="w-full rounded-lg border border-border/50 bg-background/50 p-2 sm:p-3">
                  <div className="flex justify-center [&_iframe]:mx-auto">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        toast.error("Google Login Failed");
                      }}
                      text="continue_with"
                      shape="pill"
                      size="large"
                      theme="filled_black"
                      useOneTap={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-destructive border border-destructive/20 bg-destructive/10 px-3 py-2 rounded-lg text-center w-full">
                  Google client ID not configured
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground px-4 sm:px-6">
            <div>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
