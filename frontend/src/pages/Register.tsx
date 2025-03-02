import Form from "../components/Form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthFormSchema, AuthFormSchemaType } from "@/utils/AuthFormSchema";
import { useQueryClient } from "@tanstack/react-query";
import useToasts from "@/hooks/useToasts";

const Register = () => {
  const { addToast } = useToasts();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(AuthFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = (values: AuthFormSchemaType) => {
    axios
      .post("auth/register", values)
      .then((res) => {
        queryClient.setQueryData(["me"], () => {
          return res.data;
        });
        navigate("/");
        addToast("account created succefuly", "success");
      })
      .catch((err) => err);
  };
  return (
    <div className="flex items-center justify-center flex-grow">
      <Form onSubmit={handleSubmit((values) => onSubmit(values))}>
        <Form.Title> Register </Form.Title>
        <Form.FieldsContainer gap={12}>
          <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.Input
              placeholder="JohnDeo@gmail.com"
              type="text"
              {...register("email")}
            />
            <Form.Message error={true}>{errors.email?.message}</Form.Message>
          </Form.Field>
          <Form.Field>
            <Form.Label>Password</Form.Label>
            <Form.Input
              placeholder="Enter your password"
              type="password"
              {...register("password")}
            />
            <Form.Message error={true}>{errors.password?.message}</Form.Message>
          </Form.Field>
        </Form.FieldsContainer>

        <Form.Message center={true} className="text-blue-500">
          <Link to={"/forgot-password"}> Forgot password ?</Link>{" "}
        </Form.Message>

        <Button size="parent">Submit</Button>
        <Form.Message center={true}>
          <Link to={"/register"}>
            You don't have an account?{" "}
            <span className="text-blue-500">Create one Now!</span>
          </Link>
        </Form.Message>
      </Form>
    </div>
  );
};

export default Register;
