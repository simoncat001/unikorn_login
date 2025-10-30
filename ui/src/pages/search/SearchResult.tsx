import { Container } from "@material-ui/core";
import VisibilitySensor from "react-visibility-sensor";
import { WordCard } from "../../components/search/WordCardComponent";
import { TemplateCard } from "../../components/search/TemplateCardComponent";
import { DataCard } from "../../components/search/DataCardComponent";
import { MGIDCard } from "../../components/search/MGIDCardComponent";
import { sortListElem } from "../../common/Utils";

type SearchResultProps = {
  resultMergedList: sortListElem[];
  query: string;
  isLoaded: boolean;
  isClicked: boolean;
  isAuthed: boolean;
  setLastCardVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const SearchResult: React.FC<SearchResultProps> = ({
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
            item.type === "word" ? (
              <WordCard
                key={"word" + index}
                item={item.wordValue!}
                query={query}
                loggedIn={isAuthed}
              />
            ) : item.type === "template" ? (
              <TemplateCard
                key={"template" + index}
                item={item.templateValue!}
                query={query}
                loggedIn={isAuthed}
              />
            ) : item.type === "data" ? (
              <DataCard
                key={"data" + index}
                item={item.dataValue!}
                query={query}
                loggedIn={isAuthed}
              />
            ) : (
              <MGIDCard
                key={"MGID" + index}
                item={item.MGIDValue!}
                query={query}
                loggedIn={isAuthed}
              />
            );
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

const resultComponent = {
  SearchResult,
};

export default resultComponent;
