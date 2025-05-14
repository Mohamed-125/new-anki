import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Form from "../components/Form";
import Button from "../components/Button";
import { useQueryClient } from "@tanstack/react-query";
import useToasts from "@/hooks/useToasts";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/Drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import useMediaQuery from "@/hooks/useMediaQuery";

import React, { useDeferredValue, useEffect, useState } from "react";
import useGetCurrentUser from "@/hooks/useGetCurrentUser";
import useGetCourses from "@/hooks/Queries/useGetCourses";
import useDebounce from "@/hooks/useDebounce";
// Define the schema fذor username validation
const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
});

// Define the schema for proficiency level
const proficiencySchema = z.object({
  proficiencyLevel: z.enum(["a1", "a2", "b1", "b2"]),
});

// Define the combined schema for all steps
const userProfileSchema = z.object({
  username: usernameSchema.shape.username,
  language: z.string(),
  proficiencyLevel: proficiencySchema.shape.proficiencyLevel,
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

const proficiencyOptions = [
  { value: "a1", label: "A1", description: "New to the language" },
  { value: "a2", label: "A2", description: "Basic knowledge of the language" },
  { value: "b1", label: "B1", description: "Intermediate level" },
  { value: "b2", label: "B2", description: "Upper intermediate level" },
];

const UserProfile = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // Track animation direction: 1 for forward, -1 for backward
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [isUserNameChecked, setIsUserNameChecked] = useState(false);
  const { addToast } = useToasts();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { courses } = useGetCourses();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      username: "",
      language: undefined,
      proficiencyLevel: undefined,
    },
    mode: "onChange",
  });

  const watchUsername = watch("username");
  const watchLanguage = watch("language");
  const watchProficiencyLevel = watch("proficiencyLevel");

  // Check if username is unique
  const checkUsernameUnique = async () => {
    if (!watchUsername || watchUsername.length < 3) return;

    setIsCheckingUsername(true);
    setUsernameError("");

    try {
      const response = await axios.post("auth/check-username", {
        username: watchUsername,
      });

      if (!response.data.isUnique) {
        setUsernameError("This username is already taken");
        return false;
      }
      setIsUserNameChecked(true);

      return true;
    } catch (error) {
      setUsernameError("Error checking username availability");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const deferredUsername = useDebounce(watchUsername, 400);

  useEffect(() => {
    if (watchUsername && watchUsername.length >= 3) {
      setIsUserNameChecked(false);
    }
  }, [watchUsername]);

  useEffect(() => {
    if (deferredUsername) {
      checkUsernameUnique();
    }
  }, [deferredUsername]);

  const handleNextStep = async (e: React.MouseEvent) => {
    // Prevent default to ensure no form submission occurs
    e.preventDefault();
    e.stopPropagation();

    let isValid = false;

    if (step === 1) {
      isValid = await trigger("username");
      if (isValid) {
        const isUnique = await checkUsernameUnique();

        if (!isUnique) {
          return;
        }
      } else {
        return;
      }
    } else if (step === 2) {
      isValid = await trigger("language");
      if (!isValid) return;
    }

    setDirection(1); // Set direction to forward
    setStep(step + 1);
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    // Prevent default to ensure no form submission occurs
    e.preventDefault();
    e.stopPropagation();

    setDirection(-1); // Set direction to backward
    setStep(step - 1);
  };

  const { setSelectedLearningLanguage } = useGetCurrentUser();
  const onSubmit = async (data: UserProfileFormData) => {
    try {
      // // Send the complete profile data to the backend
      const response = await axios.patch("auth/update-profile", {
        ...data,

        languages: [data.language],
        selectedNativeLanguage,
      });

      // Update the user data in the cache
      queryClient.setQueryData(["me"], (oldData: any) => {
        return {
          ...oldData,
          ...response.data,
        };
      });

      setSelectedLearningLanguage(data.language);
      addToast("Profile updated successfully", "success");

      // After successful login in your Login component
      const redirectPath = sessionStorage.getItem("redirectPath") || "/";
      sessionStorage.removeItem("redirectPath"); // Clean up
      navigate(redirectPath);
    } catch (error) {
      addToast("Failed to update profile", "error");
    }
  };

  const selectedLanguage = (language: string) => {
    setValue("language", language as any);
  };

  const selectProficiencyLevel = (level: string) => {
    setValue("proficiencyLevel", level as any);
  };

  // Animation variants for the steps
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      position: "absolute",
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 30,
      },
    }),
    center: {
      x: 0,
      opacity: 1,
      position: "relative",
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      position: "absolute",
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 250,
        damping: 30,
      },
    }),
  };

  // Define height variants for the form container based on step
  const formHeightVariants = {
    step1: {
      height: "auto",
      minHeight: "350px",
    },
    step2: {
      height: "auto",
      minHeight: "600px",
    },
    step3: {
      height: "auto",
      minHeight: "690px",
    },
    step4: {
      height: "auto",
      minHeight: "320px",
    },
  };

  // Define a consistent transition for the container
  const containerTransition = {
    type: "spring",
    stiffness: 200,
    damping: 25,
    duration: 0.5,
    ease: [0.4, 0, 0.2, 1],
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedNativeLanguage, setSelectedNativeLanguage] = useState("");

  return (
    <div className="flex flex-grow justify-center items-center py-4 sm:px-2">
      <Form
        onSubmit={handleSubmit(onSubmit)}
        className="!mx-auto w-full max-w-none h-full sm:!px-1"
      >
        <motion.div
          className="overflow-hidden !mx-auto relative p-10 sm:!px-7 sm:!py-7 w-full max-w-2xl  rounded-xl shadow-lg"
          animate={`step${step}`}
          variants={formHeightVariants}
          initial={false}
          layout
          layoutId="form-container"
          transition={containerTransition}
        >
          <Form.Title className="mb-6 text-2xl font-bold text-center sm:text-xl">
            Complete Your Profile
          </Form.Title>

          <div className="mb-8">
            <div className="flex relative justify-between items-center">
              {/* Step indicators with connecting lines */}
              <div className="absolute right-0 left-0 top-1/2 z-0 h-1 bg-gray-200 -translate-y-1/2" />
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex relative z-10 justify-center items-center w-10 h-10 rounded-full ${
                    i <= step
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i}
                </div>
              ))}
              {/* Active progress line */}
              <div
                className="absolute left-0 top-1/2 z-0 h-1 transition-all duration-300 -translate-y-1/2 bg-primary"
                style={{
                  width: `${(step - 1) * 33.33}%`,
                  transition: "width 0.3s ease-in-out",
                }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                // @ts-ignore
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Form.FieldsContainer gap={12} className="space-y-4">
                  <Form.Field>
                    <Form.Label className="font-medium">
                      Choose a Username
                    </Form.Label>
                    <Form.Input
                      placeholder="Enter your username"
                      type="text"
                      {...register("username")}
                      // onChange={checkUsernameUnique}
                      isLoading={isCheckingUsername}
                    />
                    <Form.Message error={true} className="text-sm">
                      {errors.username?.message || usernameError}
                    </Form.Message>
                  </Form.Field>
                </Form.FieldsContainer>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                // @ts-ignore
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Form.FieldsContainer gap={12} className="space-y-4">
                  <Form.Field>
                    <Form.Label className="font-medium">
                      Choose a Language to Learn
                    </Form.Label>
                    <div className="">
                      {courses?.map((course) => (
                        <div
                          key={course.lang}
                          onClick={() => selectedLanguage(course.lang)}
                          className={`flex    items-center px-6 py-3 h-32 text-center rounded-lg border-b-2 cursor-pointer transition-all ${
                            watchLanguage === course.lang
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <img
                              src={course.flag}
                              className="object-cover mr-3 mb-2 w-16 h-16 rounded-full border border-gray-200"
                              alt={`${course.lang} flag`}
                            />
                            <span className="text-lg font-medium">
                              {course.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Form.Field>
                </Form.FieldsContainer>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                // @ts-ignore
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <Form.FieldsContainer gap={12} className="space-y-4">
                  <Form.Field>
                    <Form.Label className="font-medium">
                      Your Proficiency Level
                    </Form.Label>
                    <div className="flex flex-col gap-6 mt-4">
                      {proficiencyOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => selectProficiencyLevel(option.value)}
                          className={`flex flex-col p-6 rounded-lg border-2 cursor-pointer transition-all ${
                            watchProficiencyLevel === option.value
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex gap-3 items-center">
                            <span className="text-xl font-bold">
                              {option.label}
                            </span>
                            <span className="text-gray-600">
                              - {option.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Form.Field>
                </Form.FieldsContainer>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                // @ts-ignore
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {isDesktop ? (
                  <Popover open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="primary-outline"
                        className="justify-start !text-black !w-full !max-w-none"
                      >
                        {selectedNativeLanguage ? (
                          <>{selectedNativeLanguage}</>
                        ) : (
                          <>+ Select translation language</>
                        )}
                      </Button>
                    </PopoverTrigger>{" "}
                    <PopoverContent
                      className="w-[200px]  z-[100000]  p-0"
                      align="start"
                    >
                      <LanguagesList
                        setIsSelectOpen={setIsSelectOpen}
                        setSelectedNativeLanguage={setSelectedNativeLanguage}
                      />{" "}
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Drawer open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="primary-outline"
                        className="justify-start !text-black w-full"
                      >
                        {selectedNativeLanguage ? (
                          <>{selectedNativeLanguage}</>
                        ) : (
                          <>+ Select translation language</>
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className=" z-[100000]">
                      <div className="mt-4 border-t">
                        <LanguagesList
                          setIsSelectOpen={setIsSelectOpen}
                          setSelectedNativeLanguage={setSelectedNativeLanguage}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex absolute bottom-4 justify-between mt-8">
            {step > 1 ? (
              <Button
                type="button"
                onClick={(e: any) => handlePrevStep(e)}
                variant="primary-outline"
                className="px-6 mr-2"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={(e: any) => handleNextStep(e)}
                disabled={
                  step === 1
                    ? !isUserNameChecked ||
                      isCheckingUsername ||
                      !!errors.username ||
                      !!usernameError
                    : step === 2
                    ? !watchLanguage
                    : step === 3
                    ? !watchProficiencyLevel
                    : false
                }
                className="px-6"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={() => {
                  console.log("clicked");
                }}
                disabled={!selectedNativeLanguage}
                className="px-6"
              >
                Complete
              </Button>
            )}
          </div>
        </motion.div>
      </Form>
    </div>
  );
};

function LanguagesList({
  setIsSelectOpen,
  setSelectedNativeLanguage,
}: {
  setIsSelectOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedNativeLanguage: React.Dispatch<React.SetStateAction<string>>;
}) {
  type LanguagesType = {
    value: string;
    label: string;
  };

  const languages: LanguagesType[] = [
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "am", label: "Amharic" },
    { value: "ar", label: "Arabic" },
    { value: "hy", label: "Armenian" },
    { value: "az", label: "Azerbaijani" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bs", label: "Bosnian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "ny", label: "Chichewa" },
    { value: "zh", label: "Chinese (Simplified)" },
    { value: "zh-TW", label: "Chinese (Traditional)" },
    { value: "co", label: "Corsican" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "nl", label: "Dutch" },
    { value: "en", label: "English" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "tl", label: "Filipino" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "gu", label: "Gujarati" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "iw", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "hmn", label: "Hmong" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jv", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "rw", label: "Kinyarwanda" },
    { value: "ko", label: "Korean" },
    { value: "ku", label: "Kurdish (Kurmanji)" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "lt", label: "Lithuanian" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mn", label: "Mongolian" },
    { value: "my", label: "Myanmar (Burmese)" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "or", label: "Odia (Oriya)" },
    { value: "ps", label: "Pashto" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pa", label: "Punjabi" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sm", label: "Samoan" },
    { value: "gd", label: "Scots Gaelic" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "su", label: "Sundanese" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "tt", label: "Tatar" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "tr", label: "Turkish" },
    { value: "tk", label: "Turkmen" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "ug", label: "Uyghur" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "xh", label: "Xhosa" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
  ];

  return (
    <Command
      filter={(value, search) => {
        if (value.toLowerCase().includes(search.toLowerCase())) return 1;
        return 0;
      }}
    >
      <CommandInput placeholder="Filter playlist..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {languages.map((language) => (
            <CommandItem
              key={language.value}
              value={language.label}
              onSelect={(value) => {
                setSelectedNativeLanguage(
                  languages.find((priority) => priority.label === value)
                    ?.label || ""
                );
                setIsSelectOpen(false);
              }}
            >
              {language.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export default UserProfile;
