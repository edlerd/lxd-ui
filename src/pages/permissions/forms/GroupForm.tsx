import { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { GroupSubForm } from "pages/permissions/panels/CreateGroupPanel";
import FormLink from "components/FormLink";
import { pluralize } from "util/instanceBulkActions";

export interface GroupFormValues {
  name: string;
  description: string;
}

interface Props {
  formik: FormikProps<GroupFormValues>;
  setSubForm: (subForm: GroupSubForm) => void;
  identityCount: number;
  identityModifyCount: number;
  permissionCount: number;
  permissionModifyCount: number;
  isEditing?: boolean;
}

const GroupForm: FC<Props> = ({
  formik,
  setSubForm,
  identityCount,
  identityModifyCount,
  permissionCount,
  permissionModifyCount,
  isEditing = true,
}) => {
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
      />
      <FormLink
        title={(isEditing ? "Edit " : "Add ") + pluralize("identity", 2)}
        icon="user-group"
        onClick={() => setSubForm("identity")}
        isModified={identityModifyCount > 0}
        subText={
          identityCount === 0
            ? `No ${pluralize("identity", 2)}`
            : `${identityCount} ${pluralize("identity", identityCount)}`
        }
      />
      <FormLink
        title={(isEditing ? "Edit " : "Add ") + pluralize("permission", 2)}
        icon="lock-locked"
        onClick={() => setSubForm("permission")}
        isModified={permissionModifyCount > 0}
        subText={
          permissionCount === 0
            ? `No ${pluralize("permission", 2)}`
            : `${permissionCount} ${pluralize("permission", permissionCount)}`
        }
      />
    </Form>
  );
};

export default GroupForm;