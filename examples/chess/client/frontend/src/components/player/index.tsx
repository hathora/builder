import { useContext, useState, useEffect } from "react";
import { getUserDisplayName, lookupUser, UserData } from "../../../../../api/base";
import * as T from "../../../../../api/types";
import { HathoraContext } from "../../context";

const UserDisplay = ({ player }: { player: string }) => {
  const [userData, setUserData] = useState<UserData>();
  const { user } = useContext(HathoraContext)!;

  useEffect(() => {
    lookupUser(player).then(setUserData);
  }, [player]);

  const renderDisplayText = (displayName: string) => (
    <span className="flex items-center user-display">{displayName}</span>
  );

  if (userData === undefined) {
    return <div className="max-w-md p-1 m-1 text-center">{renderDisplayText(player)}</div>;
  }

  return (
    <div className="max-w-md p-1 m-1">
      <div className="flex items-center text-center font-semibold dark:text-white">
        {userData.id === user.id ? (
          <div>You:{renderDisplayText(getUserDisplayName(userData))}</div>
        ) : (
          <div>{renderDisplayText(getUserDisplayName(userData))}</div>
        )}
      </div>
    </div>
  );
};

const PlayerDisplay = ({ value }: { value: T.Player }) => {
  return <UserDisplay player={value.id} />;
};

export default PlayerDisplay;
