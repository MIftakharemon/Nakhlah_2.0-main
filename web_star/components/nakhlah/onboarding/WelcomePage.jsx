/* eslint-disable @next/next/no-img-element */
// import { Button } from "@/components/ui/button";

// export default function WelcomePage({ onStart }: { onStart: () => void }) {
//   return (
//     <div className="min-h-[calc(100vh_-_64px)] flex flex-col items-center justify-between py-10 px-6 max-w-md mx-auto">
//       {/* Mascot */}
//       <div className="flex flex-col items-center">
//         <div className="relative">
//           <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white shadow-sm rounded-full px-4 py-1 text-sm">
//             Hi there! I'm El!
//           </div>

//           <img
//             src="/mascot.png"
//             width={160}
//             height={160}
//             alt="El mascot"
//             className="z-10"
//           />
//         </div>

//         <h1 className="text-3xl font-bold text-violet-600 mt-4">Nakhlah</h1>
//         <p className="text-center text-gray-600 mt-2 text-sm">
//           Learn languages whenever and wherever you want.
//           It’s free and forever.
//         </p>
//       </div>

//       {/* Buttons */}
//       <div className="w-full mt-10 space-y-3">
//         <Button
//           className="w-full h-12 text-white rounded-full bg-violet-600 hover:bg-violet-700 transition"
//           onClick={onStart}
//         >
//           GET STARTED
//         </Button>

//         <Button
//           variant="outline"
//           className="w-full h-12 rounded-full text-violet-600 border-violet-200 hover:bg-violet-50"
//         >
//           I ALREADY HAVE AN ACCOUNT
//         </Button>
//       </div>
//     </div>
//   );
// }

import { Button } from "@/components/ui/button";
import { Mascot } from "../Mascot";

export function WelcomeStep({ onStart, onLogin }) {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col items-center text-center">
      {/* speech bubble */}
      <div className="bg-white shadow-sm px-4 py-2 rounded-full text-sm mb-4">
        Hi there! I’m El!
      </div>

      {/* mascot */}
      <Mascot size="xxl" mood="happy" />

      {/* app title */}
      <h1 className="text-3xl font-bold text-violet-600 mb-2">Nakhlah</h1>

      <p className="text-muted-foreground mb-10">
        Learn languages whenever and wherever you want. It’s free and forever.
      </p>

      {/* buttons */}
      <Button
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold mb-3"
        onClick={onStart}
      >
        GET STARTED
      </Button>

      <Button
        variant="secondary"
        className="w-full bg-violet-100 text-violet-600"
        onClick={onLogin}
      >
        I ALREADY HAVE AN ACCOUNT
      </Button>
    </div>
  );
}
