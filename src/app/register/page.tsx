"use client";

import AuthForm from '@/components/auth/AuthForm';
import { z } from 'zod';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters."}).max(20, { message: "Username must be at most 20 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters." }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // path to show error under confirmPassword field
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: values.username });
      }
      toast({ title: "Registration Successful", description: "Your account has been created." });
      router.push('/chat');
    } catch (error: any) {
      console.error("Registration failed:", error);
      const errorCode = error.code;
      let errorMessage = "Registration failed. Please try again.";
      if (errorCode === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      }
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw new Error(errorMessage); // Propagate error to AuthForm
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] py-12">
      <AuthForm
        formSchema={registerSchema}
        onSubmit={handleRegister}
        submitButtonText="Register"
        title="Create an Account"
        description="Join Genie today to get started."
        isRegister={true}
      />
       <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-accent hover:text-accent/90 underline">
          Login here
        </Link>
      </p>
    </div>
  );
}
