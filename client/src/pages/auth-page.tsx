import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightCircle, LogIn, UserPlus, Building2, FileEdit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

// Define schema for login
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Define schema for registration
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  agencyName: z.string().min(2, "Agency name must be at least 2 characters"),
  rlaNumber: z.string().min(2, "RLA number is required"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [selectedTab, setSelectedTab] = useState<string>("login");
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      agencyName: "",
      rlaNumber: "",
    },
  });

  const onLoginSubmit = async (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    const { agencyName, rlaNumber, ...userValues } = values;
    
    // Register the user
    registerMutation.mutate({
      ...userValues,
      role: "admin", // Default role for new registrations
    });
    
    // Save agency details to settings after successful registration
    // This will be handled by the registerMutation success callback in a real implementation
  };

  // Redirect to dashboard if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - auth form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Estate Dashboard</h1>
            <p className="text-gray-600 mt-2">Real estate analytics platform</p>
          </div>
          
          <Tabs 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="space-y-6"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your dashboard
                  </CardDescription>
                </CardHeader>
                <div className="px-6 -mt-2 mb-2">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                    <strong>Login Credentials:</strong>
                    <div className="mt-1 font-mono bg-white p-2 rounded border border-blue-100 text-xs">
                      <div><span className="font-semibold">Super Admin:</span> username: <span className="text-blue-600">admin</span> / password: <span className="text-blue-600">password</span></div>
                      <div><span className="font-semibold">Agency Admin:</span> username: <span className="text-blue-600">demo</span> / password: <span className="text-blue-600">demo123</span></div>
                    </div>
                  </div>
                </div>
                <CardContent>
                  <Form {...loginForm}>
                    <form 
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)} 
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="yourusername" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Logging in...
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="justify-center text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedTab("register")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Register here
                  </button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Register to access the real estate analytics dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form 
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)} 
                      className="space-y-4"
                    >
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center text-sm">
                          <UserPlus className="mr-2 h-4 w-4 text-blue-600" />
                          Your Details
                        </h3>
                        
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. John Smith" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Choose a secure password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-4 border-t space-y-4">
                        <h3 className="font-medium flex items-center text-sm">
                          <Building2 className="mr-2 h-4 w-4 text-blue-600" />
                          Agency Information
                        </h3>
                        
                        <FormField
                          control={registerForm.control}
                          name="agencyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Agency Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Summit Real Estate" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="rlaNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>RLA Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. RLA123456" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Creating account...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Register
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="justify-center text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setSelectedTab("login")}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Login here
                  </button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side - hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="flex flex-col justify-center items-center p-12 w-full">
          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <div className="inline-block p-2 bg-blue-700 rounded-lg mb-4">
                <FileEdit className="h-10 w-10" />
              </div>
              <h2 className="text-4xl font-bold">Real Estate Analytics Platform</h2>
              <p className="text-xl text-blue-100">
                Track, analyze, and improve your agency's performance with our powerful dashboard.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <ArrowRightCircle className="h-6 w-6 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Comprehensive dashboards</h3>
                  <p className="text-blue-100">Interactive visualizations of your property sales data</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ArrowRightCircle className="h-6 w-6 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Agent performance tracking</h3>
                  <p className="text-blue-100">Monitor your team's success with detailed metrics</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ArrowRightCircle className="h-6 w-6 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg">Property management</h3>
                  <p className="text-blue-100">Efficiently manage your entire property portfolio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}