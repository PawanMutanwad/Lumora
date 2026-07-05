import { useState } from "react";
import { Link } from "react-router-dom";

import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config";
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/auth-slice";
import { toast } from "sonner";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch=useDispatch();

function onSubmit(event) {
  event.preventDefault();

  dispatch(loginUser(formData)).then((data) => {
    if (data?.payload?.success) {
      toast.success(data?.payload?.message);
    } else {
      toast.error(data?.payload?.message);
    }
  });
}

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          sign in to your account
        </h1>

        <p className="mt-2">
          Do not have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/register"
          >
            Register
          </Link>
        </p>
      </div>

      <CommonForm
        formControls={loginFormControls}
        buttonText={"Sign in"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthLogin;