import { Suspense, lazy, useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Cookies from "js-cookie";
// import config from "./config";
// import axios from "axios";
import loading from "./Icons/loading.png";
import AdminPage from "./Admin/AdminPage";
import AdminUser from "./Admin/User/Users";
import PrivateRoutes from "./Routes/PrivateRoutes";
import AdminRoutes from "./Routes/AdminRoutes";
import DistributorRoutes from "./Routes/DistributorRoutes";
import DistributorPage from "./Distributor/DistributorPage";
import UsersDistributor from "./Distributor/UserDistributor/UsersDistributor";
import AdminMessages from "./Admin/AdminMessages";
import AdminDistributors from "./Admin/AdminDistributors";
import Flip from "./Newsletter/Flip";
import AdminPurchases from "./Admin/AdminPurchases";
import Blog from "./Blog/Blog";
import AdminBlog from "./Admin/AdminBlog";
import BlogCreate from "./Blog/BlogCreate";
import BlogPage from "./Blog/BlogPage";
import TemplateAnalytics from "./Message/TemplateAnalytics";
import Contacts from "./Contacts/Contacts";
import { DataProvider } from "./Context/TemplatesApi";
// import MyEditor from "./Blog/MyEditor";

// import Loading from "./Loading/Loading";
const Login = lazy(() => import("./Login/Login"));
const Message = lazy(() => import("./Message/Message"));
const Upload = lazy(() => import("./Message/Upload"));
const Template = lazy(() => import("./Message/Template"));
const Manage = lazy(() => import("./Input/Mange"));
const Notifications = lazy(() => import("./Input/Notifications"));
const Users = lazy(() => import("./Users/Users"));
const Landing = lazy(() => import("./Landing"));
const NotFound = lazy(() => import("./NotFound/NotFound"));
const Plan = lazy(() => import("./Plan"));

function App() {
  const accessToken = Cookies.get("accessToken");
  // const navigate = useNavigate();

  return (
    <div className=" flex justify-center">
      <Suspense
        fallback={
          <div className=" w-full bg-[#ECE5DD] flex justify-center items-center h-screen  rounded-2xl overflow-x-auto">
            <img className="animate-spin" src={loading}></img>
          </div>
        }
      >
        {/* <DataProvider> */}
        <Router>
          <Routes>
            <Route element={<AdminRoutes />}>
              <Route path="/admin/messages" element={<AdminPage />} />
              <Route path="/admin/users" element={<AdminUser />} />
              <Route
                path="/admin/distributors"
                element={<AdminDistributors />}
              />
              <Route path="/admin/contact" element={<AdminMessages />} />
              <Route path="/admin/purchases" element={<AdminPurchases />} />
              <Route path="/admin/blog" element={<AdminBlog />} />
              <Route path="/admin/blog/create" element={<BlogCreate />} />
            </Route>
            <Route element={<DistributorRoutes />}>
              <Route path="/distributor/users" element={<UsersDistributor />} />
            </Route>
            <Route element={<PrivateRoutes accessToken={accessToken} />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/messages" element={<Message />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/template" element={<Template />} />
              <Route
                path="/template/analytics"
                element={<TemplateAnalytics />}
              />
              <Route path="/manage" element={<Manage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/users" element={<Users />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={<Landing accessToken={accessToken} isvalid={false} />}
            />{" "}
            <Route path="/plan-and-pricing" element={<Plan />} />
            <Route path="/newsletter" element={<Flip />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id/:title" element={<BlogPage />} />
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </Router>
        {/* </DataProvider> */}
      </Suspense>
    </div>
  );
}

export default App;
