import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function ApiDocs() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.title} API Documentation`} description="API Documentation for Sliders">
      <main>
        <iframe src="/sliders/api/index.html" style={{ width: "100%", height: "100vh", border: "none" }} />
      </main>
    </Layout>
  );
}
