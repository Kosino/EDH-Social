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
      moxfieldCommanders={[
        {
          name: "Atraxa, Grand Unifier",
          imageUrl:
            "https://cards.scryfall.io/normal/front/4/a/4a1f905f-1d55-4d02-9d24-e58070793d3f.jpg",
          deckName: "Atraxa Superfriends",
          deckUrl: "https://moxfield.com/users/Kosino",
        },
        {
          name: "Yuriko, the Tiger's Shadow",
          imageUrl:
            "https://cards.scryfall.io/normal/front/4/5/45e81487-8b8c-480b-922a-eaa9edc7201d.jpg",
          deckName: "Yuriko Ninjas",
          deckUrl: "https://moxfield.com/users/Kosino",
        },
        {
          name: "Kinnan, Bonder Prodigy",
          imageUrl:
            "https://cards.scryfall.io/normal/front/6/3/63cda4a0-0dff-4edb-ae67-a2b7e2971350.jpg",
          deckName: "Kinnan Combo",
          deckUrl: "https://moxfield.com/users/Kosino",
        },
      ]}
      decks={[
        {
          id: "1",
          name: "Atraxa Superfriends",
          format: "EDH",
          commander: "Atraxa",
          moxfieldUrl: "https://moxfield.com/",
          commanderImageUrl:
            "https://cards.scryfall.io/art_crop/front/4/a/4a1f905f-1d55-4d02-9d24-e58070793d3f.jpg",
        },
        {
          id: "2",
          name: "Yuriko Ninjas",
          format: "cEDH",
          commander: "Yuriko",
          moxfieldUrl: null,
          commanderImageUrl:
            "https://cards.scryfall.io/art_crop/front/4/5/45e81487-8b8c-480b-922a-eaa9edc7201d.jpg",
        },
        {
          id: "3",
          name: "Kinnan Combo",
          format: "cEDH",
          commander: "Kinnan",
          moxfieldUrl: null,
          commanderImageUrl:
            "https://cards.scryfall.io/art_crop/front/6/3/63cda4a0-0dff-4edb-ae67-a2b7e2971350.jpg",
        },
      ]}
      eventsJoined={12}
    />
  );
}
