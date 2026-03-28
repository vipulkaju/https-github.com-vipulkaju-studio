'use client';

import { PageHeader } from '@/components/page-header';
import { BulkDeleteForm } from '@/components/settings/bulk-delete-form';
import { KarigarManagementForm } from '@/components/settings/karigar-management-form';
import { ThemeSwitcher } from '@/components/settings/theme-switcher';
import { GitHubConnectForm } from '@/components/settings/github-connect-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Users, Paintbrush, Github } from 'lucide-react';
import { useUser } from '@/firebase';

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" />
      <Tabs defaultValue="karigars" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-4">
          <TabsTrigger
            value="karigars"
            className="h-full whitespace-normal text-xs md:text-sm"
          >
            <Users className="mr-2 h-4 w-4" />
            Karigars
          </TabsTrigger>
          <TabsTrigger
            value="github"
            className="h-full whitespace-normal text-xs md:text-sm"
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="h-full whitespace-normal text-xs md:text-sm"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Data Management
          </TabsTrigger>
          <TabsTrigger
            value="theme"
            className="h-full whitespace-normal text-xs md:text-sm"
          >
            <Paintbrush className="mr-2 h-4 w-4" />
            Theme
          </TabsTrigger>
        </TabsList>
        <TabsContent value="karigars">
          <KarigarManagementForm />
        </TabsContent>
        <TabsContent value="github">
          <GitHubConnectForm />
        </TabsContent>
        <TabsContent value="data">
          <BulkDeleteForm />
        </TabsContent>
        <TabsContent value="theme">
          <ThemeSwitcher />
        </TabsContent>
      </Tabs>
    </div>
  );
}
