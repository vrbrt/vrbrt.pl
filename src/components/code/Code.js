import {useMemo} from 'react';
import Prism from 'prismjs';

const Code = ({code, language}) => {

    const formattedCode = useMemo(() => Prism.highlight(code,Prism.languages[language],language), [code,language]);

    return (<pre className="line-numbers">
    <code className={`language-${language} match-braces`} dangerouslySetInnerHTML={{__html: formattedCode}}/>
  </pre>)
}

export default Code;