import type { FC } from "react";
import {
  Button,
  Icon,
  Input,
  Notification,
  Tooltip,
} from "@canonical/react-components";
import CloudInitConfig from "components/forms/CloudInitConfig";
import type {
  InstanceAndProfileFormikProps,
  InstanceAndProfileFormValues,
} from "./instanceAndProfileFormValues";
import { getConfigurationRowBase } from "components/ConfigurationRow";
import ScrollableConfigurationTable from "components/forms/ScrollableConfigurationTable";
import { getInstanceKey } from "util/instanceConfigFields";
import { ensureEditMode } from "util/instanceEdit";
import classnames from "classnames";
import { getConfigRowMetadata } from "util/configInheritance";

interface SshKey {
  id: string;
  name: string;
  user: string;
  fingerprint: string;
}

export interface CloudInitFormValues {
  cloud_init_network_config?: string;
  cloud_init_user_data?: string;
  cloud_init_vendor_data?: string;
  cloud_init_ssh_keys: SshKey[];
}

export const cloudInitPayload = (values: InstanceAndProfileFormValues) => {
  const result: Record<string, string | undefined> = {
    [getInstanceKey("cloud_init_network_config")]:
      values.cloud_init_network_config,
    [getInstanceKey("cloud_init_user_data")]: values.cloud_init_user_data,
    [getInstanceKey("cloud_init_vendor_data")]: values.cloud_init_vendor_data,
  };

  values.cloud_init_ssh_keys?.map((record) => {
    result[`cloud-init.ssh-keys.${record.name}`] =
      `${record.user}:${record.fingerprint}`;
  });

  return result;
};

interface Props {
  formik: InstanceAndProfileFormikProps;
}

const CloudInitForm: FC<Props> = ({ formik }) => {
  const getCloudInitRow = (label: string, name: string, value?: string) => {
    const metadata = getConfigRowMetadata(formik.values, name);
    const isOverridden = value !== undefined;

    return getConfigurationRowBase({
      configuration: <strong>{label}</strong>,
      inherited: (
        <div
          className={classnames({
            "u-text--muted": isOverridden,
            "u-text--line-through": isOverridden,
          })}
        >
          <div className="mono-font">
            <b>
              <CloudInitConfig
                key={`cloud-init-${name}`}
                config={metadata.value as string}
              />
            </b>
          </div>
          {metadata && (
            <div className="p-text--small u-text--muted">
              From: {metadata.source}
            </div>
          )}
        </div>
      ),
      override: isOverridden ? (
        <>
          <CloudInitConfig
            config={value ?? ""}
            setConfig={(config) => {
              ensureEditMode(formik);
              formik.setFieldValue(name, config);
            }}
          />
          <Button
            onClick={() => {
              ensureEditMode(formik);
              formik.setFieldValue(name, undefined);
            }}
            type="button"
            appearance="base"
            title={formik.values.editRestriction ?? "Clear override"}
            disabled={!!formik.values.editRestriction}
            hasIcon
            className="u-no-margin--bottom"
          >
            <Icon name="close" className="clear-configuration-icon" />
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            ensureEditMode(formik);
            formik.setFieldValue(name, "\n\n");
          }}
          className="u-no-margin--bottom"
          type="button"
          appearance="base"
          title={formik.values.editRestriction ?? "Create override"}
          hasIcon
          disabled={!!formik.values.editRestriction}
        >
          <Icon name="edit" />
        </Button>
      ),
    });
  };

  return (
    <div className="cloud-init">
      <div className="ssh-key-form">
        <Notification severity="information">
          Changes get applied on instance creation or restart.
        </Notification>
        {formik.values.cloud_init_ssh_keys?.map((record) => (
          <div key={record.id} className="ssh-key">
            <Input
              label="Name"
              type="text"
              value={record.name}
              className="name"
              onChange={(e) => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "cloud_init_ssh_keys",
                  formik.values.cloud_init_ssh_keys.map((key) => {
                    if (key.id !== record.id) {
                      return key;
                    }
                    return {
                      ...key,
                      name: e.target.value,
                    };
                  }),
                );
              }}
            />
            <Input
              label="User"
              type="text"
              value={record.user}
              className="user"
              onChange={(e) => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "cloud_init_ssh_keys",
                  formik.values.cloud_init_ssh_keys.map((key) => {
                    if (key.id !== record.id) {
                      return key;
                    }
                    return {
                      ...key,
                      user: e.target.value,
                    };
                  }),
                );
              }}
            />
            <Input
              label="Fingerprint"
              type="text"
              value={record.fingerprint}
              wrapperClassName="fingerprint"
              onChange={(e) => {
                ensureEditMode(formik);
                formik.setFieldValue(
                  "cloud_init_ssh_keys",
                  formik.values.cloud_init_ssh_keys.map((key) => {
                    if (key.id !== record.id) {
                      return key;
                    }
                    return {
                      ...key,
                      fingerprint: e.target.value,
                    };
                  }),
                );
              }}
            />
            <div>
              <Button
                onClick={() => {
                  ensureEditMode(formik);
                  formik.setFieldValue(
                    "cloud_init_ssh_keys",
                    formik.values.cloud_init_ssh_keys.filter(
                      (key) => key.name !== record.name,
                    ),
                  );
                }}
                type="button"
                title="Remove key"
                hasIcon
              >
                <Icon name="delete" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => {
            ensureEditMode(formik);
            formik.setFieldValue("cloud_init_ssh_keys", [
              ...formik.values.cloud_init_ssh_keys,
              {
                id: `ssh-key-${formik.values.cloud_init_ssh_keys.length + 1}`,
                name: `ssh-key-${formik.values.cloud_init_ssh_keys.length + 1}`,
                user: "root",
                fingerprint: "",
              },
            ]);
          }}
          hasIcon
        >
          <Icon name="plus" />
          <span>Attach SSH key</span>
        </Button>
      </div>
      <ScrollableConfigurationTable
        configurationExtra={
          <Tooltip
            message="Applied only to images that have the cloud-init package installed."
            className="configuration-extra"
          >
            <Icon name="warning-grey" />
          </Tooltip>
        }
        rows={[
          getCloudInitRow(
            "Network config",
            "cloud_init_network_config",
            formik.values.cloud_init_network_config,
          ),
          getCloudInitRow(
            "User data",
            "cloud_init_user_data",
            formik.values.cloud_init_user_data,
          ),
          getCloudInitRow(
            "Vendor data",
            "cloud_init_vendor_data",
            formik.values.cloud_init_vendor_data,
          ),
        ]}
      />
    </div>
  );
};

export default CloudInitForm;
