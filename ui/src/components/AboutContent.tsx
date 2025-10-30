import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import Common from "../common/Common";
import { Box, Typography, Link } from "@material-ui/core";

const aColor = Common.allColor;

const useStyles = makeStyles(() =>
  createStyles({
    primaryBlock: {
      backgroundColor: aColor.primaryColor,
      width: "5px",
      height: "auto",
      margin: "0px 10px",
    },
  })
);

const Paragraph: React.FC<{ content: string }> = ({ content }) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" textAlign="justify" my={1.5}>
      <Typography className={fontClasses.unboldFont}>{content}</Typography>
    </Box>
  );
};

const ParagraphWithLink: React.FC<{ content: string; link: string }> = ({
  content,
  link,
}) => {
  const fontClasses = Common.fontStyles();
  const preventDefault = (event: React.SyntheticEvent) =>
    event.preventDefault();
  return (
    <Box display="flex" textAlign="justify" my={1.5}>
      <Typography className={fontClasses.unboldFont}>
        {content}
        <Link
          href={link}
          onClick={(event: React.SyntheticEvent) => {
            preventDefault(event);
            window.open(link);
          }}
        >
          {link}
        </Link>
      </Typography>
    </Box>
  );
};

const ImageDescription: React.FC<{ src: string; description: string }> = ({
  src,
  description,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" m={1.5} flexDirection="column" alignItems="center">
      <img src={src} alt={description} width="80%" />
      <Typography
        className={fontClasses.BodyGrey}
        style={{ marginTop: "12px" }}
      >
        {description}
      </Typography>
    </Box>
  );
};
/*
const VideoDescription: React.FC<{ src: string; description: string }> = ({
  src,
  description,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" my={1.5}>
      <iframe
        src={src}
        title={description}
        scrolling="no"
        frameBorder="no"
        allowFullScreen={true}
        width="640px"
        height="480px"
      />
      <Typography
        className={fontClasses.BodyGrey}
        style={{ marginTop: "12px" }}
      >
        {description}
      </Typography>
    </Box>
  );
}; */

const FileDescription: React.FC<{ src: string; description: string }> = ({
  src,
  description,
}) => {
  const fontClasses = Common.fontStyles();

  return (
    <Box display="flex" textAlign="justify" my={1.5}>
      <Typography className={fontClasses.unboldFont}>
        <a
          target="_blank"
          rel="noreferrer"
          href={src}
          style={{ color: aColor.primaryColor }}
        >
          {description}
        </a>
      </Typography>
    </Box>
  );
};

const H2Title: React.FC<{ title: string }> = ({ title }) => {
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex" my={1.5}>
      <Typography className={fontClasses.H2}>{title}</Typography>
    </Box>
  );
};

const H4Title: React.FC<{ title: string }> = ({ title }) => {
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex" my={1.5}>
      <Typography className={fontClasses.H4}>{title}</Typography>
    </Box>
  );
};

const SubTitle: React.FC<{ title: string }> = ({ title }) => {
  const classes = useStyles();
  const fontClasses = Common.fontStyles();
  return (
    <Box display="flex" my={1.5}>
      <div className={classes.primaryBlock}></div>
      <Typography className={fontClasses.CardChineseName}>{title}</Typography>
    </Box>
  );
};

const AboutContent: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="768px"
      minWidth="768px"
      my="49px"
    >
      <H2Title title="About MGSDB" />
      <Paragraph content="" />
      <Paragraph content="MGSDB，材料基因组标准数据库（Materials Genome Standard Database），一个通过提供材料数据标准化基础设施和服务来促进材料数据融合共享生态构建，加速材料科学研究和新材料发现的数据服务平台。" />
      <H2Title title="Why to do" />
      <Paragraph content="数据是未来材料研究、开发、应用的核心要素，数据驱动模式代表了材料基因工程最核心的理念和最先进的方法，在材料基因组的高通量实验、高通量计算和数据库3个技术要素中，数据是真正具有革命性的核心元素。作为一个多技术、跨学科融合创新方法，材料基因工程在高通量数据产生技术和数据分析技术上已取得稳步可观的突破和进步，而技术要素间的协同交互问题日渐突出，数据层面的高效融合成为解决这一问题的关键，研究数据的规范化成为材料基因工程融合创新成果得以转化所必须面对的问题。同时，原有经验式、无规范式、小规模数据管理使用方法也不再满足材料基因工程高维度参量、跨尺度分析、高量级数据的管理分析需求，亟待建立一个与材料基因工程研究方法配套的新型数据管理应用体系框架。" />
      <Paragraph content="数据标准化是一个形成团体性共识的过程，需要通过科学的理论指导和专业性实践作为实现基础，经专业性探讨后形成共识性认识和实施规范。在数据规范化理论方面，学术界、工业界、科研基金机构和学术出版商都经历过长期的探索研讨，并在2016年汇集到一起共同设计并认可了一套简明而可衡量的科研数据管理原则——FAIR（Findable, Accessible, Interoperable, Reusable）原则，即可发现、可获取、可互操作、可再利用原则，此后在国际科学界得到广范支持和转化应用；2019年8月，中国材料与试验团体标准委员会材料基因工程领域委员会（CSTM/FC97）结合材料科学数据特点和FAIR原则要求，正式发布了世界范围内首个关于材料基因工程数据的团体标准—《材料基因工程数据通则》（简称《数据通则》），对材料基因工程数据库的收录内容和基本要求进行了规定，成为材料基因工程科研数据标准体系建设的起点。" />
      <Paragraph content="基于标准化的数字化、共识性、共享化特点，本研究团队结合在多个国家级、省市重点项目的标准化实践经验，提取材料基因工程数据标准化的关键组成要素和逻辑组成关系，构建了材料基因组标准数据平台（MGSDB）。MGSDB平台将作为数据标准化的配套性基础设施和原始参考系统，持续提供数据标准化技术支持，推动材料基因工程数据标准化的全面启动和信息共享交互，逐步实现全领域的数据标准化生态落成。" />
      <SubTitle title="Reference link" />
      <ParagraphWithLink
        content="CSTM标准审核流程："
        link="http://www.cstm.com.cn/channel/details/biaozhunzhixiudingliucheng"
      />
      <SubTitle title="Reference" />
      <Paragraph content="FAIR原则：Wilkinson, M., Dumontier, M., Aalbersberg, I. et al. The FAIR Guiding Principles for scientific data management and stewardship. Sci Data 3, 160018 (2016). https://doi.org/10.1038/sdata.2016.18" />
      <SubTitle title="Download" />
      <FileDescription
        src="/files/CSTM材料基因工程数据通则-final.pdf"
        description="CSTM材料基因工程数据通则 - final.pdf"
      />
      <H2Title title="What to do" />
      <Paragraph content="本平台所管理的的标准内容是基于材料基因工程数据通则制定的具体材料制备、表征、分析、计算模拟、机器学习等研发方法标准，相关标准需在提交CSTM审核后（参见Reference link）方可在本平台创建共享。平台提供的标准化服务包括标准化词汇和标准化模板的创建共享、标准研发数据的创建、存储、发表、引用等功能；在此基础上设计了新型数据组织关联关系，构建了与材料基因工程数据探索需求相配套的应用数据创建体系；另外，平台专门针对材料基因工程数据设计制定了永久性数据唯一标识——MGID，对本平台产生的管理的研发数据自动标识，同时对于本平台以外的材料基因数据也可申请分配具有全领域内唯一性的MGID数据标识符，MGID具有唯一性、可解析、持久性等特点，可通过标识直接返回到数据所在位置。" />
      <H2Title title="How to do" />
      <H4Title title="（1）创建准备——标准制定与审核" />
      <Paragraph content="标准的制定需参考《材料基因工程数据通则》对数据类型的划分和内容要求来制定，如图所示，数据类型包含三类：样品信息、源数据和衍生数据，数据内容需要基于FAIR原则中的可再利用原则制定数据的元数据规范，在制定元数据规范时用到的词汇需要考虑其通用性特点来命名，避免出现歧义，对于本平台的标准词汇库中相关的已有词汇可直接采用，以实现元数据元素层面的可互操作性。所制定的元数据规范提交CSTM审核（参见Reference link），立项后将元数据规范内容在本平台创建共享，以形成辐射协同效应，建立广泛影响力。" />
      <ImageDescription
        src="images/Fig1.png"
        description="图1 材料基因工程数据通则对数据的要求"
      />
      <H4Title title="（2）标准词汇的创建共享" />
      <Paragraph content="基于制定的元数据规范，将其中包含的元数据元素依次建于标准词汇库中，为创建标准化模板作元素准备；同时，标准词汇库将为后续元数据标准规范的制定提供可靠参考。标准词汇库数据量的将随标准数量的增多不断积累，在术语层面逐渐实现数据的标准化和可互操作性。" />
      <H4Title title="（3）标准模板的创建共享" />
      <Paragraph content="基于制定的元数据规范，将其中由元数据元素构成的元数据模板创建于标准模板库中，元数据模板包含元数据元素间的层级关系，针对这一需求，平台提供了单元素、对象型、数组型三种设计元素层级关系的容纳框架支持，满足标准规范所包含的元数据模式在标准模板库中的整体创建；标准模板创建成功后将在平台共享，为从事相同方法研究的所有团队提供标准化数据管理模板，可实现后续数据交互的无缝对接融合，将在协作项目管理和材料基因工程融合创新上产生长期辐射效应。" />
      <H4Title title="（4）标准研发数据" />
      <Paragraph content="基于平台已建立的标准化数据模板，可根据自身的研究数据在标准研发数据库中选择对应的模板创建符合标准研发数据，数据创建成功平台将为数据自动创建唯一标识MGID，可用于在平台的数据关联，以及基于广域互联网的数据查询获取。研发数据可根据自身数据管理需要，选择公开程度，保护数据所有者的权益归属。" />
      <H4Title title="（5）应用数据的创建——新型数据组织管理应用体系的创建" />
      <Paragraph content="应用数据的创建是基于材料基因工程对数据存储和应用的专用需求设计的，实现研发数据的独立化存储和数据应用时的灵活组合。用户可在模板创建界面按需选择研发数据的标准词汇创建应用模板，也可根据标准制定审核流程创建标准应用模板，在此基础上，可以搜索与之相关的研发数据，再将搜索到的研发数据及其关联数据映射到所建的应用模板中，得到符合自身需要的组合应用数据，进而实现按需定义应用模板并基于已有的研发数据创建应用数据，满足材料基因工程成分-结构-工艺-性能的多维数据构建探索需求。" />
      <H4Title title="（6）数据标识——MGID" />
      <Paragraph content="结合FAIR原则对科研数据管理的可发现和可获取需求，设计了材料基因工程数据唯一标识MGID，可根据MGID实现数据的查询、解析和获取。在本平台管理的研发数据创建成功后可直接分配具备领域唯一性的MGID标识；对于其他平台管理的MGID，也可在本平台申请实现数据的领域唯一标识。" />
      <H4Title title="（7）数据的发表引用" />
      <Paragraph content="用户可根据自身需求管理自身数据开放程度，选择数据的公开程度，可实现数据的发表和引用，能够可为数据的共享和权益归属提供平台级支持。" />
      <H2Title title="Prospect" />
      <Paragraph content="MGSDB基于FAIR原则设计，在本平台实现数据标准化的同时，可以实现FAIR原则的可发现、可获取、可互操作及可再利用要求，满足材料科学数据的面向未来的长久科学管理要求。平台将作为数据标准化的有机组成部分，提供全套标准化基础设施，并衍生全场景标准化技术服务支持，全面推动材料基因工程数据标准化生态的落成，成为实现数据驱动模式下大数据生态效势的关键技术枢纽" />
    </Box>
  );
};

export default AboutContent;
