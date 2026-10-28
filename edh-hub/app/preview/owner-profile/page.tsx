import { ProfilePreview } from "@/components/profile/ProfilePreview";

/** Local/visual preview of logged-in owner profile chrome (not linked in nav). */
export default function OwnerProfilePreviewPage() {
  return (
    <ProfilePreview
      displayName="Kosino"
      username="kosino"
      rawDisplayName="Kosino"
      bio="Admin EDH Social. Stavím cEDH a organizuju stoly v Mostě a Bílině."
      avatarKey="star-wizard"
      avatarUrl={null}
      moxfieldUserUrl="https://moxfield.com/users/Kosino"
      isOwner
      admin
      commanders={["Atraxa", "Yuriko", "Kinnan"]}
      decks={[
        { id: "1", name: "Atraxa Superfriends", format: "EDH", commander: "Atraxa", moxfieldUrl: "https://moxfield.com/" },
        { id: "2", name: "Yuriko Ninjas", format: "cEDH", commander: "Yuriko", moxfieldUrl: null },
        { id: "3", name: "Kinnan Combo", format: "cEDH", commander: "Kinnan", moxfieldUrl: null },
      ]}
      eventsJoined={12}
    />
  );
}
