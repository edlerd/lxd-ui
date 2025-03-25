import type { FC } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon, Row, useNotify } from "@canonical/react-components";
import Loader from "components/Loader";
import StoragePoolHeader from "pages/storage/StoragePoolHeader";
import NotificationRow from "components/NotificationRow";
import StoragePoolOverview from "pages/storage/StoragePoolOverview";
import CustomLayout from "components/CustomLayout";
import EditStoragePool from "pages/storage/EditStoragePool";
import { useClusterMembers } from "context/useClusterMembers";
import TabLinks from "components/TabLinks";
import type { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useStoragePool } from "context/useStoragePools";

const StoragePoolDetail: FC = () => {
  const notify = useNotify();
  const { data: clusterMembers = [] } = useClusterMembers();
  const { name, project, activeTab } = useParams<{
    name: string;
    project: string;
    activeTab?: string;
  }>();

  if (!name) {
    return <>Missing name</>;
  }
  if (!project) {
    return <>Missing project</>;
  }

  const member = clusterMembers[0]?.server_name ?? undefined;

  const { data: pool, error, isLoading } = useStoragePool(name, member);

  if (error) {
    notify.failure("Loading storage details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading storage details..." />;
  } else if (!pool) {
    return <>Loading storage details failed</>;
  }

  const tabs: (string | TabLink)[] = [
    "Overview",
    "Configuration",
    {
      component: () => (
        <Link
          to={`/ui/project/${project}/storage/volumes?pool=${pool.name}`}
          className="p-tabs__link"
        >
          Volumes <Icon name="external-link" />
        </Link>
      ),
      label: "Volumes",
    },
  ];

  return (
    <CustomLayout
      header={<StoragePoolHeader name={name} pool={pool} project={project} />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/project/${project}/storage/pool/${name}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <StoragePoolOverview pool={pool} project={project} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            <EditStoragePool pool={pool} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default StoragePoolDetail;
