import type { ProfileCardType } from "@/entities/user/model/types";
import { ProfileCard } from "@/entities/user/ui";

interface ProfileInfoProps {
  profile: ProfileCardType;
}

export const ProfileInfo = ({ profile }: ProfileInfoProps) => {
    return (
        <div>
            <ProfileCard profile={profile} />
        </div>
    );
}

export default ProfileInfo;