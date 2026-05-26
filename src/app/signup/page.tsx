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
import { Briefcase, Loader2 } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { GoogleLogin } from "@react-oauth/google";

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && accessToken) {
      router.push("/dashboard");
    }
  }, [mounted, accessToken, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      // Constructing name if needed, or sending directly depending on API requirements
      const payload = {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`.trim(),
      };
      
      await api.post("/api/v1/auth/register", payload);
      
      toast.success("Account created successfully! Please log in.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const response = await api.post("/api/v1/auth/google", {
        idToken: credentialResponse.credential
      });
      const { accessToken, refreshToken, user } = response.data.data || response.data;
      if (accessToken) {
        setAuth(accessToken, refreshToken, user);
        toast.success("Successfully signed up with Google!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to retrieve access token.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Google Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight">ApplyFlow <span className="text-primary">AI</span></span>
          </Link>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Enter your details to get started with ApplyFlow AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="John" className="bg-background/50" {...register("firstName")} />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Doe" className="bg-background/50" {...register("lastName")} />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" className="bg-background/50" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" className="bg-background/50" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full h-11 text-base mt-2">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
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
              {mounted ? (
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? (
                  <div className="relative w-full h-11 group">
                    {/* Custom Premium UI Button */}
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full h-full bg-background/50 border border-border/50 flex items-center justify-center gap-2 hover:bg-muted/50 transition-all duration-200 rounded-lg font-medium text-sm text-foreground shadow-sm"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>Google</span>
                    </Button>

                    {/* Hidden real GoogleLogin on top */}
                    <div 
                      className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden rounded-lg"
                      style={{ opacity: 0 }}
                    >
                      <div className="w-full h-full [&>div]:!w-full [&>div>iframe]:!w-full [&>div>iframe]:!h-full [&>div>iframe]:!min-w-full [&>div>iframe]:!min-h-full [&>div>iframe]:!max-w-full [&>div>iframe]:!opacity-0">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => {
                            toast.error('Google Signup Failed');
                          }}
                          width="100%"
                          theme="filled_black"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-destructive border border-destructive/20 bg-destructive/10 px-3 py-2 rounded-lg text-center w-full">
                    Google client ID not configured
                  </div>
                )
              ) : (
                <div className="h-11 w-full flex items-center justify-center border border-border/50 bg-background/50 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
