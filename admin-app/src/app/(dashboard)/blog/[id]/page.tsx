import BlogEditor from "@/components/blog/BlogEditor";

export default function Page({ params }: { params: { id: string } }) {
  return <BlogEditor params={params} />;
}
