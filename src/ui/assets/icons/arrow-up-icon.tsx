import React from "react";

interface ArrowUpIconProps {}

const ArrowUpIcon: React.FC<ArrowUpIconProps> = ({}) => {
  return (
    <svg
      width="20px"
      height="20px"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M15 14H5l5-9 5 9z" fill="#448118" />
    </svg>
  );
};

export default ArrowUpIcon;
