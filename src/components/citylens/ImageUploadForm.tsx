
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReportFormSchema, type ReportFormValues } from '@/lib/schemas';
import { generateImageDescription } from '@/ai/flows/generate-image-description';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Sparkles, Send, Loader2, AlertCircle, CheckCircle, MapPin, Mail, Shield, Landmark } from 'lucide-react';

export function ImageUploadForm() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [editableDescription, setEditableDescription] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const { toast } = useToast();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: {
      editableDescription: "",
      photoLocation: "",
      userEmail: "",
      userComments: "",
      sendToLocalPolice: false,
      sendToCityHall: false,
    },
  });

  useEffect(() => {
    // When editableDescription state changes (e.g. after AI analysis),
    // update the form value.
    if (editableDescription) {
      form.setValue("editableDescription", editableDescription);
    }
  }, [editableDescription, form]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditableDescription("");
      setAnalysisError(null);
      setSubmitSuccess(false);
      form.reset(); 
    }
  };

  const convertFileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyzeImage = async () => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setEditableDescription("");
    form.setValue("editableDescription", "");


    try {
      const photoDataUri = await convertFileToDataUri(imageFile);
      const result = await generateImageDescription({ photoDataUri });
      if (result.description) {
        setEditableDescription(result.description);
        form.setValue("editableDescription", result.description); 
        toast({
          title: "Analysis Complete",
          description: "Image description generated.",
        });
      } else {
        throw new Error("AI did not return a description.");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error during analysis.";
      setAnalysisError(`Failed to analyze image: ${errorMessage}`);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        form.setValue("photoLocation", locationString, { shouldValidate: true });
        toast({
          title: "Location Fetched",
          description: `Coordinates: ${locationString}`,
        });
        setIsFetchingLocation(false);
      },
      (error) => {
        let message = "Could not retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please enable it in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out.";
        }
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
        setIsFetchingLocation(false);
      },
      { timeout: 10000 } 
    );
  };


  const onSubmit = async (values: ReportFormValues) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    console.log("Submitting report:", {
      image: imageFile?.name,
      ...values,
    });

    await new Promise(resolve => setTimeout(resolve, 1500)); 

    setIsSubmitting(false);
    setSubmitSuccess(true);
    toast({
      title: "Report Submitted!",
      description: "Your urban issue report has been notionally sent.",
      action: <CheckCircle className="text-accent" />,
    });
  };
  
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setEditableDescription("");
      setAnalysisError(null);
      setSubmitSuccess(false);
      form.reset();
    } else {
        toast({
            title: "Invalid File Type",
            description: "Please upload an image file.",
            variant: "destructive",
        });
    }
  }, [toast, form]);


  return (
    <div className="space-y-8 max-w-2xl mx-auto py-8 px-4">
      <Card className="shadow-lg rounded-xl" onDragOver={onDragOver} onDrop={onDrop}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <UploadCloud className="text-primary" />
            Report Urban Issue
          </CardTitle>
          <CardDescription>Capture or upload an image of an urban issue, and AI will help describe it.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="flex items-center justify-center w-full"
          >
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 10MB)</p>
              </div>
              <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>

          {imageUrl && (
            <div className="mt-4 p-2 border rounded-md bg-background shadow-inner">
              <Image src={imageUrl} alt="Preview" width={500} height={300} className="rounded-md object-contain max-h-80 w-full" data-ai-hint="urban issue preview" />
            </div>
          )}
        </CardContent>
        {imageFile && !editableDescription && !analysisError && (
          <CardFooter>
            <Button onClick={handleAnalyzeImage} disabled={isAnalyzing || !imageFile} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Image...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Analyze Image with AI
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {analysisError && !editableDescription && (
        <div role="alert" className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center gap-2 shadow">
          <AlertCircle className="h-5 w-5" />
          <p>{analysisError}</p>
        </div>
      )}

      {editableDescription && !submitSuccess && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Confirm Report Details</CardTitle>
            <CardDescription>Verify the AI-generated description, add location, contact information, and select recipients.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="editableDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Issue Description (AI Generated)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="AI-generated description of the issue..."
                          rows={5}
                          className="resize-none rounded-md shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Photo Location</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input 
                            placeholder="e.g., Main St & Park Ave, or Lat, Long" 
                            {...field} 
                            className="flex-grow rounded-md shadow-sm"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isFetchingLocation}
                          variant="outline"
                          className="rounded-md shadow-sm"
                          aria-label="Get current location"
                        >
                          {isFetchingLocation ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                          <span className="sr-only">Get Current Location</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="userEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        To receive updates regarding the issues, please provide your email address below (optional)
                      </FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} className="rounded-md shadow-sm"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Additional Comments (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any other details you'd like to add?" {...field} className="rounded-md shadow-sm"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3 pt-2">
                  <FormLabel className="text-base font-medium">Select Report Recipients <span className="text-destructive">*</span></FormLabel>
                  <FormDescription>
                    Please select at least one destination for your report. 
                  </FormDescription>
                  
                  <FormField
                    control={form.control}
                    name="sendToLocalPolice"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="sendToLocalPolice"
                          />
                        </FormControl>
                        <FormLabel htmlFor="sendToLocalPolice" className="font-normal flex items-center gap-2 cursor-pointer flex-1 py-1">
                          <Shield className="h-5 w-5 text-primary" />
                          Local Police
                        </FormLabel>
                        <FormMessage /> 
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sendToCityHall"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            id="sendToCityHall"
                          />
                        </FormControl>
                        <FormLabel htmlFor="sendToCityHall" className="font-normal flex items-center gap-2 cursor-pointer flex-1 py-1">
                          <Landmark className="h-5 w-5 text-primary" />
                          City Hall
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>


                <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-md shadow-md py-3">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Report...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send Report
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      {submitSuccess && (
         <Card className="shadow-lg rounded-xl bg-green-50 border-green-300">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 font-semibold">
                <CheckCircle />
                Report Sent Successfully!
            </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
             <p className="text-green-600">Thank you for your contribution to improving our city. Your report has been recorded.</p>
             <Button onClick={() => {
                 setSubmitSuccess(false);
                 setImageFile(null);
                 setImageUrl(null);
                 setEditableDescription("");
                 form.reset(); 
             }} className="w-full rounded-md shadow-sm" variant="outline">
                 Submit Another Report
             </Button>
           </CardContent>
         </Card>
      )}
    </div>
  );
}
