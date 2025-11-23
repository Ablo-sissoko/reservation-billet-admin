import React from "react";
import { Search, Star, Trash2, Archive } from "lucide-react";

const mails = [
  {
    id: 1,
    name: "Julia Jalal",
    tag: "Primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
  },
  {
    id: 2,
    name: "Minerva Barnett",
    tag: "Work",
    subject: "Get Best Advertiser In Your Side Pocket",
    time: "8:13 AM",
  },
  {
    id: 3,
    name: "Peter Lewis",
    tag: "Friends",
    subject: "Vacation Home Rental Success",
    time: "7:52 PM",
  },
  {
    id: 4,
    name: "Anthony Briggs",
    tag: "",
    subject: "Free Classifieds Using Them To Promote Your Stuff Online",
    time: "7:52 PM",
    starred: true,
  },
  {
    id: 5,
    name: "Clifford Morgan",
    tag: "Social",
    subject: "Enhance Your Brand Potential With Giant Advertising Blimps",
    time: "4:13 PM",
  },
  {
    id: 6,
    name: "Cecilia Webster",
    tag: "Friends",
    subject: "Always Look On The Bright Side Of Life",
    time: "3:52 PM",
  },
  {
    id: 7,
    name: "Harvey Manning",
    tag: "",
    subject: "Curling Irons Are As Individual As The Women Who Use Them",
    time: "2:30 PM",
  },
  {
    id: 8,
    name: "Willie Blake",
    tag: "Primary",
    subject: "Our Bachelor of Commerce program is ACBSP-accredited.",
    time: "8:38 AM",
  },
  {
    id: 9,
    name: "Minerva Barnett",
    tag: "Work",
    subject: "Get Best Advertiser In Your Side Pocket",
    time: "8:13 AM",
  },
  {
    id: 10,
    name: "Fanny Weaver",
    tag: "",
    subject: "Free Classifieds Using Them To Promote Your Stuff Online",
    time: "7:52 PM",
  },
  {
    id: 11,
    name: "Olga Hogan",
    tag: "Social",
    subject: "Enhance Your Brand Potential With Giant Advertising Blimps",
    time: "4:13 PM",
  },
  {
    id: 12,
    name: "Lora Houston",
    tag: "Friends",
    subject: "Vacation Home Rental Success",
    time: "7:52 PM",
  },
];

const tagColors = {
  Primary: "bg-blue-100 text-blue-700",
  Work: "bg-orange-100 text-orange-700",
  Friends: "bg-pink-100 text-pink-700",
  Social: "bg-indigo-100 text-indigo-700",
};

export default function Mailbox() {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow border">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search mail"
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Archive className="w-5 h-5 text-gray-600 cursor-pointer" />
          <Trash2 className="w-5 h-5 text-gray-600 cursor-pointer" />
        </div>
      </div>

      {/* Mail List */}
      <ul>
        {mails.map((mail) => (
          <li
            key={mail.id}
            className="flex items-center justify-between px-4 py-2 border-b hover:bg-gray-50 text-sm"
          >
            <div className="flex items-center gap-3">
              <input type="checkbox" className="cursor-pointer" />
              {mail.starred && <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />}
              <span className="font-medium">{mail.name}</span>
              {mail.tag && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${tagColors[mail.tag]}`}
                >
                  {mail.tag}
                </span>
              )}
              <span className="text-gray-600 truncate max-w-xs">{mail.subject}</span>
            </div>
            <span className="text-gray-500 text-xs">{mail.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
