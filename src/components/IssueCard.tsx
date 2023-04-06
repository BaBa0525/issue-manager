import { useIssueContext } from "@/pages";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loading } from "./Loading";
import { EditCard } from "./issue-card/EditCard";
import { OptionDropdown } from "./issue-card/OptionDropdown";

export const IssueCard: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { issue } = useIssueContext();

  return (
    <li key={issue.id} className="relative my-4 rounded-md bg-white px-12 py-2">
      <div style={{ opacity: isDeleting ? 0.3 : 1 }}>
        {isEditing ? (
          <EditCard setIsEditing={setIsEditing} />
        ) : (
          <>
            <OptionDropdown
              setIsEditing={setIsEditing}
              setIsDeleting={setIsDeleting}
            />
            <div className="flex flex-col gap-3">
              <h2 className="mt-3 text-2xl font-bold">{issue.title}</h2>
              <div>
                <span className="mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700">
                  {issue.customLabel}
                </span>
              </div>

              <ReactMarkdown className="whitespace- prose break-words lg:prose-lg">
                {issue.body}
              </ReactMarkdown>
            </div>
          </>
        )}
      </div>
      {isDeleting && <Loading />}
    </li>
  );
};
