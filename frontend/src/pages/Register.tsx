import React, { useContext } from "react";
import Form from "../components/Form";
import { Link } from "react-router-dom";
import axios from "axios";
import { userContext } from "../context/UserContext";
import Button from "../components/Button";

const Register = () => {
  const { user, setUser } = useContext(userContext);

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    axios
      .post("auth/register", data)
      .then((res) => {
        res;
        setUser(res.data);
      })
      .catch((err) => err);
  };
  return (
    <div className="flex items-center justify-center  flex-grow ">
      <Form onSubmit={onSubmit}>
        <Form.Title> Register </Form.Title>
        <Form.FieldsContainer>
          <Form.Field>
            <Form.Label>Email</Form.Label>
            <Form.Input
              required
              placeholder="JohnDeo@gmail.com"
              type="text"
              name="email"
            />
          </Form.Field>
          <Form.Field>
            <Form.Label>Password</Form.Label>
            <Form.Input
              required
              placeholder="12345678"
              type="password"
              name="password"
            />
          </Form.Field>
        </Form.FieldsContainer>

        <Button size="parent" className={"mt-6"}>
          Submit
        </Button>
        <Form.Message center={true}>
          <Link to={"/login"}>
            Do you an account?
            <span className="text-blue-500"> login Now!</span>
          </Link>
        </Form.Message>
      </Form>
    </div>
  );
};

export default Register;
