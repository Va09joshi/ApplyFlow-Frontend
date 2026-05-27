"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, KeyRound, ArrowRight } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";
import { api } from "@/lib/api";
import axios from "axios";

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    try {
      setIsLoading(true);
      await api.post("/api/v1/auth/reset-password", {
        email: data.email,
        token: token,
        password: data.password,
      });
      setIsSuccess(true);
      toast.success("Password reset successfully.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to reset password. The link might be expired."));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="font-semibold">Invalid Reset Link</p>
          <p className="text-sm mt-1">This link is invalid or missing the required security token.</p>
        </div>
        <Button asChild>
          <Link href="/forgot-password">Request new link</Link>
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center space-y-5 py-6"
      >
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <KeyRound className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">Password Updated!</h3>
          <p className="text-sm text-muted-foreground">
            Your password has been successfully reset. You can now use your new password to log in.
          </p>
        </div>
        <Button className="w-full mt-4" asChild>
          <Link href="/login">
            Go to Login <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Confirm Email Address</Label>
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
        <Label htmlFor="password">New Password</Label>
        <Input 
          id="password" 
          type="password" 
          className="bg-background/50" 
          {...register("password")}
        />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          className="bg-background/50" 
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading} className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
        Reset Password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Set New Password</CardTitle>
            <CardDescription>
              Create a new secure password for your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground px-4 sm:px-6 border-t border-border/30 pt-4">
            <Link href="/login" className="text-primary font-medium hover:underline">
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
