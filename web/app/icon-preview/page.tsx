"use client";

import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { 
  LuUser, 
  LuUsers
} from "react-icons/lu";
import { 
  HiUser, 
  HiUserCircle, 
  HiUserGroup 
} from "react-icons/hi";
// Note: Hi2 icons may have different names - using available alternatives
import { 
  FaUser, 
  FaUserCircle, 
  FaUserAlt 
} from "react-icons/fa";
import { 
  MdPerson, 
  MdAccountCircle, 
  MdPersonOutline 
} from "react-icons/md";

const iconGroups = [
  {
    name: "Lucide Icons (Currently Used)",
    icons: [
      { name: "LuUser", component: LuUser, note: "Current icon" },
      { name: "LuUsers", component: LuUsers, note: "Multiple users" },
    ]
  },
  {
    name: "Heroicons v1",
    icons: [
      { name: "HiUser", component: HiUser },
      { name: "HiUserCircle", component: HiUserCircle },
      { name: "HiUserGroup", component: HiUserGroup },
    ]
  },
  {
    name: "Font Awesome",
    icons: [
      { name: "FaUser", component: FaUser },
      { name: "FaUserCircle", component: FaUserCircle },
      { name: "FaUserAlt", component: FaUserAlt },
    ]
  },
  {
    name: "Material Design",
    icons: [
      { name: "MdPerson", component: MdPerson },
      { name: "MdAccountCircle", component: MdAccountCircle },
      { name: "MdPersonOutline", component: MdPersonOutline },
    ]
  },
];

export default function IconPreviewPage() {
  return (
    <Layout>
      <Container className="max-w-6xl py-16">
        <PageHeader title="User Icon Options" />
        <p className="text-muted-foreground mb-8">
          Visual comparison of different user icon options. Click any icon to see it at different sizes.
        </p>

        <div className="space-y-12">
          {iconGroups.map((group) => (
            <div key={group.name} className="space-y-4">
              <h2 className="text-xl font-semibold border-b border-border pb-2">
                {group.name}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {group.icons.map((icon) => {
                  const IconComponent = icon.component;
                  return (
                    <div
                      key={icon.name}
                      className="flex flex-col items-center p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-center w-16 h-16 mb-3">
                        <IconComponent size={24} className="text-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{icon.name}</p>
                        {icon.note && (
                          <p className="text-xs text-muted-foreground mt-1">{icon.note}</p>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <IconComponent size={16} className="text-muted-foreground" />
                        <IconComponent size={18} className="text-foreground" />
                        <IconComponent size={24} className="text-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-lg border border-border bg-muted/20">
          <h3 className="text-lg font-semibold mb-3">Recommended Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <HiUserCircle size={24} className="text-foreground" />
                <span className="font-medium">HiUserCircle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                More prominent than the current icon, with a circular background that makes it stand out better.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <FaUserCircle size={24} className="text-foreground" />
                <span className="font-medium">FaUserCircle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Font Awesome user circle - clean and recognizable. Very commonly used in web applications.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 mb-2">
                <MdAccountCircle size={24} className="text-foreground" />
                <span className="font-medium">MdAccountCircle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Material Design account circle - modern and professional. Matches well with modern UI designs.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
