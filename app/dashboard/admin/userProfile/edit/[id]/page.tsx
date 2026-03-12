"use client";

import React, { useEffect, useState } from "react";
import { UserProfileForm } from "../../_components/UserProfileForm";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { UserDocumentsPanel } from "../../_components/UserDocumentsPanel";

export default function EditUserProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/users/${id}`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-10 text-center">ไม่พบข้อมูลผู้ใช้</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <UserProfileForm initialData={user} isEdit>
        <UserDocumentsPanel userId={id} />
      </UserProfileForm>
    </div>
  );
}
