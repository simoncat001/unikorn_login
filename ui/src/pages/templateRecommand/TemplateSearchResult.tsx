import { Container } from "@material-ui/core";
import VisibilitySensor from "react-visibility-sensor";
import { TemplateCard } from "../../components/search/TemplateCardComponent";
import { sortListElem } from "../../common/Utils";

type SearchResultProps = {
  resultMergedList: sortListElem[];
  query: string;
  isLoaded: boolean;
  isClicked: boolean;
  isAuthed: boolean;
  setLastCardVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const TemplateSearchResult: React.FC<SearchResultProps> = ({
  resultMergedList,
  query,
  isLoaded,
  isClicked,
  isAuthed,
  setLastCardVisible,
}) => {
  function onSensorChange(isVisible: boolean) {
    setLastCardVisible(isVisible);
  }
  if (!isClicked) {
    return null;
  }

  if (!isLoaded) {
    return <div>未搜索到相关结果...</div>;
  } else {
    return (
      <Container>
        {resultMergedList.map((item, index) => {
          const currentCard =
            
              <TemplateCard
                key={"template" + index}
                item={item.templateValue!}
                query={query}
                loggedIn={isAuthed}
              />

          return index === resultMergedList.length - 1 ? (
            <VisibilitySensor key={index} onChange={onSensorChange}>
              {currentCard}
            </VisibilitySensor>
          ) : (
            currentCard
          );
        })}
      </Container>
    );
  }
};

const templateResultComponent = {
  TemplateSearchResult,
};

export default templateResultComponent;
