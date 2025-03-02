"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { backend_url } from "../../backendUrl"
import { toast } from "sonner";
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

// Form schemas
const basicInfoSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  mobile_number: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
})

const personalDetailsSchema = z.object({
  profile_pic: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"], {
    required_error: "Please select a gender",
  }),
  age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Age must be a positive number",
  }),
})

const professionalInfoSchema = z.object({
  role: z.enum(["Reviewer", "Researcher", "Both"], {
    required_error: "Please select a role",
  }),
  expertise: z.string().min(2, { message: "Please enter your area of expertise" }),
  institutions: z.array(z.string()),
})

const additionalInfoSchema = z.object({
  interests: z.array(z.string()),
  social_links: z.array(z.string().url({ message: "Please enter a valid URL" }).or(z.string().length(0))),
  visibility: z.boolean(),
})

export default function UpdateProfile() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1)
  const {currentUser , setCurrentUser} = useAuth();
  const [formData, setFormData] = useState({
    email: currentUser?.email,
    mobile_number: currentUser?.mobile_number,
    name: currentUser?.name,
    profile_pic: currentUser?.profile_pic,
    gender: currentUser?.gender,
    age: currentUser?.age.toString(),
    role: currentUser?.role,
    expertise: currentUser?.expertise.toString(),
    institutions: currentUser?.institutions,
    interests: currentUser?.interests,
    social_links: currentUser?.social_links,
    visibility: currentUser?.visibility,
  })
  const [isLoading, setIsLoading] = useState(false)


  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  // Form refs to access form methods across steps
  const basicInfoForm = useForm({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      email: formData.email || "",
      mobile_number: formData.mobile_number || "",
      name: formData.name || "",
    },
    mode: "onSubmit",
    values: formData, // This will update form values when formData changes
  })

  const personalDetailsForm = useForm({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      profile_pic: formData.profile_pic || "",
      gender: formData.gender || undefined,
      age: formData.age ? String(formData.age) : "",
    },
    mode: "onSubmit",
    values: formData,
  })

  const professionalInfoForm = useForm({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      role: formData.role || undefined,
      expertise: formData.expertise || "",
      institutions: formData.institutions || [],
    },
    mode: "onSubmit",
    values: formData,
  })

  const additionalInfoForm = useForm({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      interests: formData.interests || [],
      social_links: formData.social_links || [],
      visibility: formData.visibility !== undefined ? formData.visibility : true,
    },
    mode: "onSubmit",
    values: formData,
  })

  // Function to validate current step before proceeding
  const handleNext = async () => {
    let isValid = false;
    
    switch (step) {
      case 1:
        isValid = await basicInfoForm.trigger();
        break;
      case 2:
        isValid = await personalDetailsForm.trigger();
        break;
      case 3:
        isValid = await professionalInfoForm.trigger();
        break;
      case 4:
        isValid = await additionalInfoForm.trigger();
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  }

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  // Backend submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const formPayload = {
        name: formData.name,
        // Exclude email and mobile_number as they are not editable
        role: formData.role,
        gender: formData.gender,
        age: formData.age,
        expertise: formData.expertise,
        institutions: formData.institutions,
        interests: formData.interests,
        social_links: formData.social_links,
        visibility: formData.visibility,
      };

      // Remove undefined fields
      Object.keys(formPayload).forEach(key => {
        if (formPayload[key] === undefined || formPayload[key] === "") {
          delete formPayload[key];
        }
      });

      console.log("Updating profile with:", formPayload);

      const response = await fetch(`${backend_url}/api/auth/update-user-data`, {
        method: 'PUT',
        body: JSON.stringify(formPayload),
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Update failed');
        return;
      }

      let result = await response.json();
      console.log(result.user)
      setCurrentUser(result.user);

      // Handle profile picture update separately if changed
      if (formData.profile_pic && formData.profile_pic !== result.profile_pic) {
        const picResponse = await fetch(`${backend_url}/api/auth/update-profile-pic`, {
          method: 'PUT',
          body: JSON.stringify({ profilePic: formData.profile_pic }),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
  
        if (!picResponse.ok) {
          const errorData = await picResponse.json();
          toast.error(errorData.message || 'Error updating profile picture');
          return;
        }
  
        const picResult = await picResponse.json();
        console.log('Profile picture updated:', picResult);
        toast.success('Profile picture updated!');
      }

      navigate('/profile')

    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.message || 'Update failed! Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl mb-4">Loading profile data...</h2>
          <Progress value={100} className="w-64 h-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Update Your Profile</CardTitle>
          <CardDescription>
            Make changes to your profile - Step {step} of {totalSteps}
          </CardDescription>
          <Progress value={progress} className="h-2 mt-2" />
        </CardHeader>
        <form onSubmit={(e)=>e.preventDefault()}>
          <CardContent className="min-h-[450px]">
            {step === 1 && <BasicInfoStep form={basicInfoForm} formData={formData} updateFormData={updateFormData} />}
            {step === 2 && <PersonalDetailsStep form={personalDetailsForm} formData={formData} updateFormData={updateFormData} />}
            {step === 3 && <ProfessionalInfoStep form={professionalInfoForm} formData={formData} updateFormData={updateFormData} />}
            {step === 4 && <AdditionalInfoStep form={additionalInfoForm} formData={formData} updateFormData={updateFormData} />}
            {step === 5 && <ReviewStep formData={formData} />}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handlePrevious} disabled={step === 1}>
              Previous
            </Button>
            <div>
              {step < totalSteps ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit}>Save Changes</Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}


// Step 1: Basic Information
function BasicInfoStep({ form, formData, updateFormData }) {

  // Handle field changes without validation
  const handleChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Non-editable)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your email"
                  {...field}
                  disabled={true}
                  className="bg-gray-100"
                />
              </FormControl>
              <FormDescription>Email cannot be changed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number (Non-editable)</FormLabel>
              <FormControl>
                <div className="flex">
                  <Input
                    className="w-15 mr-2 bg-gray-100"
                    value={'+91'}
                    disabled={true}
                  />
                  <Input
                    className="rounded-l-none bg-gray-100"
                    placeholder="Your mobile number"
                    maxLength={10}
                    {...field}
                    disabled={true}
                  />
                </div>
              </FormControl>
              <FormDescription>Mobile number cannot be changed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your full name"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    handleChange("name", e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

// Step 2: Personal Details
function PersonalDetailsStep({ form, formData, updateFormData }) {
  const [previewUrl, setPreviewUrl] = useState(formData.profile_pic || "")

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // For preview only
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Convert file to base64 for sending to server
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        updateFormData({ profile_pic: reader.result }) // This will be a base64 string
        form.setValue("profile_pic", reader.result)
      }
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={previewUrl} alt="Profile" />
            <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <div className="flex items-center">
            <Label htmlFor="profile_pic" className="cursor-pointer">
              <div className="flex items-center space-x-2 text-primary">
                <Upload className="h-4 w-4" />
                <span>Change profile picture</span>
              </div>
              <Input id="profile_pic" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </Label>
          </div>
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  updateFormData({ gender: value })
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter your age"
                  min="0"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    updateFormData({ age: e.target.value ? Number.parseInt(e.target.value) : "" })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

// Step 3: Professional Information
function ProfessionalInfoStep({ form, formData, updateFormData }) {
  const [institution, setInstitution] = useState("")
  const [institutions, setInstitutions] = useState(formData.institutions || [])

  useEffect(() => {
    setInstitutions(formData.institutions || []);
  }, [formData.institutions]);

  const addInstitution = () => {
    if (institution.trim() && !institutions.includes(institution.trim())) {
      const updatedInstitutions = [...institutions, institution.trim()]
      setInstitutions(updatedInstitutions)
      updateFormData({ institutions: updatedInstitutions })
      form.setValue("institutions", updatedInstitutions)
      setInstitution("")
    }
  }

  const removeInstitution = (index) => {
    const updatedInstitutions = institutions.filter((_, i) => i !== index)
    setInstitutions(updatedInstitutions)
    updateFormData({ institutions: updatedInstitutions })
    form.setValue("institutions", updatedInstitutions)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addInstitution();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  updateFormData({ role: value })
                }}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Reviewer">Reviewer</SelectItem>
                  <SelectItem value="Researcher">Researcher</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select the role that best describes your work.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expertise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area of Expertise</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your area of expertise"
                  className="resize-none"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    updateFormData({ expertise: e.target.value })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="institutions">Institutions</Label>
          <div className="flex space-x-2">
            <Input
              id="institutions"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add your institution"
            />
            <Button type="button" onClick={addInstitution} size="sm" className="mx-2">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {institutions.map((inst, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {inst}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeInstitution(index)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Form>
  )
}

// Step 4: Additional Information
function AdditionalInfoStep({ form, formData, updateFormData }) {
  const [interest, setInterest] = useState("")
  const [interests, setInterests] = useState(formData.interests || [])
  const [socialLink, setSocialLink] = useState("")
  const [socialLinks, setSocialLinks] = useState(formData.social_links || [])

  useEffect(() => {
    setInterests(formData.interests || []);
    setSocialLinks(formData.social_links || []);
  }, [formData.interests, formData.social_links]);

  const addInterest = () => {
    if (interest.trim() && !interests.includes(interest.trim())) {
      const updatedInterests = [...interests, interest.trim()]
      setInterests(updatedInterests)
      updateFormData({ interests: updatedInterests })
      form.setValue("interests", updatedInterests)
      setInterest("")
    }
  }

  const removeInterest = (index) => {
    const updatedInterests = interests.filter((_, i) => i !== index)
    setInterests(updatedInterests)
    updateFormData({ interests: updatedInterests })
    form.setValue("interests", updatedInterests)
  }

  const addSocialLink = () => {
    if (socialLink.trim() && !socialLinks.includes(socialLink.trim())) {
      const updatedLinks = [...socialLinks, socialLink.trim()]
      setSocialLinks(updatedLinks)
      updateFormData({ social_links: updatedLinks })
      form.setValue("social_links", updatedLinks)
      setSocialLink("")
    }
  }

  const removeSocialLink = (index) => {
    const updatedLinks = socialLinks.filter((_, i) => i !== index)
    setSocialLinks(updatedLinks)
    updateFormData({ social_links: updatedLinks })
    form.setValue("social_links", updatedLinks)
  }

  const handleInterestKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addInterest();
    }
  };

  const handleSocialLinkKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addSocialLink();
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="interests">Research Interests</Label>
          <div className="flex space-x-2">
            <Input
              id="interests"
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              onKeyPress={handleInterestKeyPress}
              placeholder="Add a research interest"
            />
            <Button type="button" onClick={addInterest} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {interests.map((item, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeInterest(index)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="social_links">Social Links</Label>
          <div className="flex space-x-2">
            <Input
              id="social_links"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
              onKeyPress={handleSocialLinkKeyPress}
              placeholder="Add a social media link"
            />
            <Button type="button" onClick={addSocialLink} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 truncate max-w-[80%]"
                >
                  {link}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeSocialLink(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Profile Visibility</FormLabel>
                <FormDescription>Make your profile visible to other users</FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    updateFormData({ visibility: checked })
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}

// Step 5: Review
function ReviewStep({ formData }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Review Your Information</h2>
        <p className="text-muted-foreground">Please review your information before saving changes</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={formData.profile_pic} alt="Profile" />
          <AvatarFallback>{formData.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-medium">{formData.name}</h3>
        <Badge variant="outline">{formData.role}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Email:</dt>
                <dd>{formData.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Mobile:</dt>
                <dd>{'+91 ' + formData.mobile_number}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Gender:</dt>
                <dd>{formData.gender || "Not specified"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Age:</dt>
                <dd>{formData.age || "Not specified"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Password:</dt>
                <dd>{formData.password ? "Will be updated" : "Unchanged"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Professional Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Role:</dt>
                <dd>{formData.role}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Expertise:</dt>
                <dd className="text-sm">{formData.expertise || "Not specified"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Institutions:</dt>
                <dd>
                  {formData.institutions && formData.institutions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.institutions.map((inst, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "None specified"
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground mb-1">Research Interests:</dt>
                <dd>
                  {formData.interests && formData.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.interests.map((interest, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    "None specified"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">Social Links:</dt>
                <dd>
                  {formData.social_links && formData.social_links.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {formData.social_links.map((link, i) => (
                        <a
                          key={i}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 text-xs truncate"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  ) : (
                    "None specified"
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Profile Visibility:</dt>
                <dd>{formData.visibility ? "Public" : "Private"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}