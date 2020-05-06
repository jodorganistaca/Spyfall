import React from "react";
import { Link } from "../plugins/i18n";

export default React.forwardRef(({ href, children }, ref) => {
  return (
    <Link href={href} passHref ref={ref}>
      <a className="MuiTypography-root MuiLink-root MuiTypography-colorTextSecondary MuiLink-underlineHover">
        {children}
      </a>
    </Link>
  );
});
