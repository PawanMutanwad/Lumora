import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section */}
      <div className="flex items-center justify-center bg-black w-1/2 px-12">
        <div className="max-w-md space-y-6 text-center text-primary-foreground">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Welcome To ECommerce Shopping
          </h1>

          <p className="text-lg text-gray-300">
            Discover amazing products with the best shopping experience.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;