import Layout from "../components/Layout";
import { Typography, Divider } from "@material-ui/core";
import { withTranslation } from "../plugins/i18n";

const HowToPlay = function ({ t }) {
  return (
    <Layout>
      <Typography variant="h3">{t("title")}</Typography>
      <Divider
        style={{ height: 1, width: "60%", margin: "10px 0px 30px 0px" }}
      />

      <Typography variant="body1" style={{ margin: "20px 30px 50px 30px" }}>
        {t("instructions")}
      </Typography>
      <Typography variant="body1" style={{ margin: "20px 30px 50px 30px" }}>
        {t("instructions")}
      </Typography>
      <Typography variant="body1" style={{ margin: "20px 30px 50px 30px" }}>
        {t("instructions")}
      </Typography>
    </Layout>
  );
};

HowToPlay.getInitialProps = async () => ({
  namespacesRequired: "how-to-play",
});

export default withTranslation("how-to-play")(HowToPlay);
