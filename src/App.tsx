import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import StepByStep from "./pages/StepByStep";
import Practice from "./pages/Practice";
import Exercise from "./pages/Exercise";
import VideoLibrary from "./pages/VideoLibrary";
import Mistakes from "./pages/Mistakes";
import LearningPlan from "./pages/LearningPlan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/learn" element={<StepByStep />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exercice" element={<Exercise />} />
            <Route path="/video-library" element={<VideoLibrary />} />
            <Route path="/mistakes" element={<Mistakes />} />
            <Route path="/learning-plan" element={<LearningPlan />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
