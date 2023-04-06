import { useDeleteIssue } from "@/hooks/useDeleteIssue";
import { useIssueContext } from "@/pages";
import { Menu, Transition } from "@headlessui/react";
import React from "react";
import { toast } from "react-hot-toast";
import { AiOutlineMore } from "react-icons/ai";

type OptionDropdownProps = {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const OptionDropdown: React.FC<OptionDropdownProps> = ({
  setIsEditing,
}) => {
  const { issue, ...queryKeys } = useIssueContext();
  const deleteIssueMutation = useDeleteIssue(queryKeys);

  return (
    <div className="absolute top-2 right-3 w-56 text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button>
          <AiOutlineMore className="gray-400 top-2 right-2 m-3 h-6 w-6" />
        </Menu.Button>
        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            as="ul"
            className="absolute right-0 z-10 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div className="p-1">
              <Menu.Item as="li">
                <button
                  className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              </Menu.Item>
              <Menu.Item as="li">
                <button
                  className="w-full rounded-md py-2 px-4 text-left hover:bg-navbar hover:text-white"
                  onClick={() =>
                    void deleteIssueMutation
                      .mutateAsync({
                        issue_number: issue.number,
                      })
                      .catch((err) => {
                        if (err instanceof Error)
                          return toast.error(err.message);
                        toast.error("Something went wrong");
                      })
                  }
                >
                  Delete
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
