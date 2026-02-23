import MainContent from "@/app/components/mainContent";
import ClientRoot from "./components/clientRoot";
import RootLayout from "./layout";

export type FileObject = {
  name: string;
  download_url: string;
};

export default async function Home() {
  return (
    <RootLayout>
      <main className="flex min-h-screen flex-col items-left justify-between p-10">
        <ClientRoot>
          <MainContent />
        </ClientRoot>
      </main>
    </RootLayout>
  );
}
