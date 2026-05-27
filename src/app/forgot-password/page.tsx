"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { api } from "@/lib/api";
import axios from "axios";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<{provider?: string, sent?: boolean} | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      return (
        responseData?.message ||
        responseData?.error ||
        responseData?.errors?.[0]?.message ||
        responseData?.errors?.[0]?.msg ||
        error.message ||
        fallback
      );
    }
    return fallback;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      setIsLoading(true);
      const res = await api.post("/api/v1/auth/forgot-password", data);
      
      const payload = res.data?.data || res.data || {};
      if (payload.delivery) setDeliveryStatus(payload.delivery);
      if (payload.resetLink) setResetLink(payload.resetLink);
      
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send reset link. Please try again."));
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
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    className="bg-background/50" 
                    {...register("email")}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-4 py-4"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link. Please check your inbox and spam folder.
                  </p>
                  
                  {deliveryStatus && (
                    <div className="mt-4 p-3 bg-muted/30 border border-border/50 rounded-lg text-left text-xs space-y-1">
                      <p className="font-medium text-foreground">Delivery Status</p>
                      <p className="text-muted-foreground">Provider: <span className="text-foreground/80 font-mono">{deliveryStatus.provider || 'unknown'}</span></p>
                      <p className="text-muted-foreground">Status: <span className={deliveryStatus.sent ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"}>{deliveryStatus.sent ? "Sent" : "Pending"}</span></p>
                    </div>
                  )}
                  
                  {resetLink && (
                    <div className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-left text-xs break-all relative">
                      <p className="font-semibold text-primary mb-1">Developer Preview Link:</p>
                      <Link href={resetLink.replace(window.location.origin, '')} className="text-primary/80 hover:underline">
                        {resetLink}
                      </Link>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="mt-4" onClick={() => setIsSubmitted(false)}>
                  Try another email
                </Button>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground px-4 sm:px-6">
            <div>
              <Link href="/login" className="flex items-center justify-center text-primary font-medium hover:underline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
