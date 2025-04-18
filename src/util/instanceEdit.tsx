import type { LxdProfile } from "types/profile";
import type { LxdInstance } from "types/instance";
import { formDeviceToPayload, parseDevices } from "util/formDevices";
import { parseCpuLimit, parseMemoryLimit } from "util/limits";
import { getInstanceConfigKeys } from "util/instanceConfigFields";
import { instanceEditDetailPayload } from "pages/instances/forms/EditInstanceDetails";
import { resourceLimitsPayload } from "components/forms/ResourceLimitsForm";
import { securityPoliciesPayload } from "components/forms/SecurityPoliciesForm";
import { snapshotsPayload } from "components/forms/InstanceSnapshotsForm";
import { cloudInitPayload } from "components/forms/CloudInitForm";
import { getUnhandledKeyValues } from "util/formFields";
import type { EditInstanceFormValues } from "pages/instances/EditInstance";
import * as Yup from "yup";
import type { EditProfileFormValues } from "pages/profiles/EditProfile";
import { migrationPayload } from "components/forms/MigrationForm";
import type { ConfigurationRowFormikProps } from "components/ConfigurationRow";
import { bootPayload } from "components/forms/BootForm";

const getEditValues = (
  item: LxdProfile | LxdInstance,
): Omit<EditProfileFormValues, "entityType" | "readOnly"> => {
  return {
    name: item.name,
    description: item.description,

    devices: parseDevices(item.devices),

    limits_cpu: parseCpuLimit(item.config["limits.cpu"]),
    limits_memory: parseMemoryLimit(item.config["limits.memory"]),
    limits_memory_swap: item.config["limits.memory.swap"],
    limits_disk_priority: item.config["limits.disk.priority"]
      ? parseInt(item.config["limits.disk.priority"])
      : undefined,
    limits_processes: item.config["limits.processes"]
      ? parseInt(item.config["limits.processes"])
      : undefined,

    security_protection_delete: item.config["security.protection.delete"],
    security_privileged: item.config["security.privileged"],
    security_nesting: item.config["security.nesting"],
    security_protection_shift: item.config["security.protection.shift"],
    security_idmap_base: item.config["security.idmap.base"],
    security_idmap_size: item.config["security.idmap.size"]
      ? parseInt(item.config["security.idmap.size"])
      : undefined,
    security_idmap_isolated: item.config["security.idmap.isolated"],
    security_devlxd: item.config["security.devlxd"],
    security_devlxd_images: item.config["security.devlxd.images"],
    security_secureboot: item.config["security.secureboot"],

    snapshots_pattern: item.config["snapshots.pattern"],
    snapshots_expiry: item.config["snapshots.expiry"],
    snapshots_schedule: item.config["snapshots.schedule"],
    snapshots_schedule_stopped: item.config["snapshots.schedule.stopped"],

    migration_stateful: item.config["migration.stateful"],
    cluster_evacuate: item.config["cluster.evacuate"],

    boot_autostart: item.config["boot.autostart"],
    boot_autostart_delay: item.config["boot.autostart.delay"],
    boot_autostart_priority: item.config["boot.autostart.priority"],
    boot_host_shutdown_timeout: item.config["boot.host_shutdown_timeout"],
    boot_stop_priority: item.config["boot.stop.priority"],

    cloud_init_network_config: item.config["cloud-init.network-config"],
    cloud_init_user_data: item.config["cloud-init.user-data"],
    cloud_init_vendor_data: item.config["cloud-init.vendor-data"],
    cloud_init_ssh_keys: Object.keys(item.config)
      .filter((item) => item.startsWith("cloud-init.ssh-keys."))
      .map((key) => {
        const [user, fingerprint] = (item.config[key] as string).split(
          /:(.*)/s,
        ); // split on first occurrence of ":"
        const name = key.split(".")[2];
        return {
          id: name,
          name: name,
          user: user,
          fingerprint: fingerprint,
        };
      }),
  };
};

export const getInstanceEditValues = (
  instance: LxdInstance,
  editRestriction?: string,
): EditInstanceFormValues => {
  return {
    instanceType: instance.type,
    profiles: instance.profiles,
    location: instance.location,
    isCreating: false,
    readOnly: true,
    entityType: "instance",
    editRestriction,
    ...getEditValues(instance),
  };
};

export const getProfileEditValues = (
  profile: LxdProfile,
  editRestriction?: string,
): EditProfileFormValues => {
  return {
    readOnly: true,
    entityType: "profile",
    editRestriction,
    ...getEditValues(profile),
  };
};

export const getInstancePayload = (
  instance: LxdInstance,
  values: EditInstanceFormValues,
) => {
  const handledConfigKeys = getInstanceConfigKeys();
  const handledKeys = new Set([
    "name",
    "description",
    "type",
    "profiles",
    "devices",
    "config",
  ]);

  return {
    ...instanceEditDetailPayload(values),
    devices: formDeviceToPayload(values.devices),
    config: {
      ...resourceLimitsPayload(values),
      ...securityPoliciesPayload(values),
      ...snapshotsPayload(values),
      ...migrationPayload(values),
      ...bootPayload(values),
      ...cloudInitPayload(values),
      ...getUnhandledKeyValues(instance.config, handledConfigKeys),
    },
    ...getUnhandledKeyValues(instance, handledKeys),
  };
};

export const InstanceEditSchema: Yup.ObjectSchema<{
  name: string;
  instanceType: string;
}> = Yup.object().shape({
  name: Yup.string().required("Instance name is required"),
  instanceType: Yup.string().required("Instance type is required"),
});

export const ensureEditMode = (formik: ConfigurationRowFormikProps) => {
  if (formik.values.readOnly) {
    formik.setFieldValue("readOnly", false);
  }
};
