// components/UserCard.jsx

import React from "react";
import { Icon } from "@iconify/react";

const UserCard = ({ application, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect ? () => onSelect(application?.id) : undefined}
      className={`transition-all duration-200 ${
        onSelect ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-sky-500 bg-sky-50" : onSelect ? "hover:bg-appleGray-50" : ""}`}
    >
      {/* User Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-soft">
          <Icon icon="material-symbols:person" className="text-xl text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-appleGray-800">
            {application?.first_name} {application?.last_name}
          </h4>
          <p className="text-sm text-appleGray-600">Student Application</p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Icon icon="material-symbols:mail" className="text-blue-600" />
          </div>
          <span className="text-appleGray-700 truncate">
            {application?.email}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-sm">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <Icon icon="material-symbols:phone" className="text-green-600" />
          </div>
          <span className="text-appleGray-700">{application?.telephone}</span>
        </div>

        <div className="flex items-start space-x-3 text-sm">
          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon icon="material-symbols:home" className="text-orange-600" />
          </div>
          <span className="text-appleGray-700 line-clamp-2">
            {application?.address}
          </span>
        </div>

        {application?.passport_number && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
              <Icon
                icon="material-symbols:passport"
                className="text-purple-600"
              />
            </div>
            <span className="text-appleGray-700">
              {application?.passport_number}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
