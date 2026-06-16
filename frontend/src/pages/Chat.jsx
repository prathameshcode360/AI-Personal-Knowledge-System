import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import { Send, Loader, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import chatService from "../services/chatService";
import toast from "react-hot-toast";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Failed to fetch conversations");
    }
  };

  const loadConversation = async (id) => {
    try {
      const data = await chatService.getConversationMessages(id);
      setMessages(data.messages);
      setCurrentConversation(data.conversation);
    } catch (error) {
      toast.error("Failed to load conversation");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatService.sendMessage(
        input,
        currentConversation?._id,
      );

      const assistantMessage = {
        role: "assistant",
        content: response.message.content,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!currentConversation) {
        setCurrentConversation({
          _id: response.conversationId,
          title: input.substring(0, 50),
        });
        fetchConversations();
      }
    } catch (error) {
      toast.error("Failed to send message");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const newChat = () => {
    setMessages([]);
    setCurrentConversation(null);
    setInput("");
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-120px)]">
        {/* Conversations Sidebar */}
        <div className="w-64 border-r bg-white rounded-lg shadow-sm mr-4 overflow-y-auto">
          <div className="p-4 border-b">
            <button
              onClick={newChat}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              New Chat
            </button>
          </div>
          <div className="p-4 space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentConversation?._id === conv._id
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-50"
                }`}>
                <p className="text-sm font-medium truncate">{conv.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p className="text-lg">Start a conversation</p>
                <p className="text-sm">Ask questions about your documents</p>
              </div>
            ) : (
              messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={tomorrow}
                              language={match[1]}
                              PreTag="div"
                              {...props}>
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}>
                      {message.content}
                    </ReactMarkdown>

                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold mb-2">Sources:</p>
                        {message.sources.map((source, i) => (
                          <div
                            key={i}
                            className="text-xs flex items-center gap-1 mb-1">
                            <FileText size={12} />
                            <span>{source.filename}</span>
                            {source.pageNumber && (
                              <span>Page {source.pageNumber}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <Loader className="animate-spin" size={20} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your documents..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
