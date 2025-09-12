'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getSuggestedTimes } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const services = [
  'Routine Check-up',
  'Vaccination',
  'Dental Cleaning',
  'Surgery Consultation',
  'Grooming',
  'Emergency Visit',
];

const appointmentFormSchema = z.object({
  ownerName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  petName: z.string().min(1, { message: "Pet's name is required." }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  serviceType: z.string({ required_error: 'Please select a service.' }),
  timeZone: z.string(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

export default function AppointmentScheduler() {
  const [isPending, startTransition] = useTransition();
  const [suggestedTimes, setSuggestedTimes] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const { toast } = useToast();
  const [timeZone, setTimeZone] = useState('');

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      ownerName: '',
      petName: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    startTransition(async () => {
      const result = await getSuggestedTimes({ ...data, timeZone });
      if (result.success && result.data) {
        setSuggestedTimes(result.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        });
      }
    });
  };
  
  const handleConfirm = () => {
      if (selectedTime) {
          setIsConfirmed(true);
      }
  };

  const handleReset = () => {
    form.reset();
    setSuggestedTimes([]);
    setSelectedTime(null);
    setIsConfirmed(false);
  };

  if (isConfirmed) {
    return (
        <section id="booking" className="w-full py-12 md:py-24 lg:py-32 bg-accent">
            <div className="container px-4 md:px-6">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader className="text-center">
                        <CalendarIcon className="mx-auto h-12 w-12 text-primary" />
                        <CardTitle className="text-3xl font-bold font-headline mt-4">Appointment Confirmed!</CardTitle>
                        <CardDescription className="text-lg">
                            Your appointment for {form.getValues('petName')} is scheduled for:
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-2xl font-semibold text-primary">{format(new Date(selectedTime!), 'PPPP p')}</p>
                        <p className="text-muted-foreground mt-2">A confirmation email has been sent to {form.getValues('email')}.</p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button onClick={handleReset}>Book Another Appointment</Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
  }

  return (
    <section id="booking" className="w-full py-12 md:py-24 lg:py-32 bg-accent">
      <div className="container px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center font-headline">Book an Appointment</CardTitle>
            <CardDescription className="text-center">
              {suggestedTimes.length > 0 ? 'Please select a time for your appointment.' : 'Fill in the details below to find available times.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedTimes.length === 0 ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Buddy" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service} value={service}>
                                {service}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Times...
                      </>
                    ) : (
                      'Find Available Times'
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-6">
                <RadioGroup onValueChange={setSelectedTime} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggestedTimes.map((time) => (
                    <div key={time}>
                        <RadioGroupItem value={time} id={time} className="sr-only" />
                        <Label htmlFor={time} className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                            <span className="font-semibold">{format(new Date(time), 'EEEE, MMMM d')}</span>
                            <span className="text-2xl">{format(new Date(time), 'p')}</span>
                        </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className='flex flex-col sm:flex-row gap-2'>
                    <Button onClick={handleConfirm} className="w-full" disabled={!selectedTime}>
                        Confirm Appointment
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="w-full">
                        Back
                    </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
