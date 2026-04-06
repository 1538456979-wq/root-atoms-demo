"use client";

import { useState } from "react";
import Header from "@/components/Header";
import InputPanel from "@/components/InputPanel";
import PreviewPanel from "@/components/PreviewPanel";
import { useHistory } from "@/hooks/useHistory";

const Home = () => {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { history, addHistory } = useHistory();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* 顶部 Header，固定 64px */}
      <Header />

      {/* 主内容区：左右分栏，占满剩余高度 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧输入区 30% */}
        <InputPanel
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          setGeneratedCode={setGeneratedCode}
          addHistory={addHistory}
          history={history}
        />

        {/* 右侧预览区 70% */}
        <PreviewPanel generatedCode={generatedCode} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Home;
