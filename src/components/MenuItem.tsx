import React from "react";
import "../styles/Header.css";
import { hover } from "@testing-library/user-event/dist/hover";

interface MenuItemPros {
  icon: any;
  title: string;
}

const MenuItem: React.FC<MenuItemPros> = ({ icon, title }) => {
  return (
    <div>
      <img src={icon} alt="" className="button" />
      <p>{title}</p>
    </div>
  );
};

export default MenuItem;
