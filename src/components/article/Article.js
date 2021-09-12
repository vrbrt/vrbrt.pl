
import Code from '../../components/code/Code';
import './Article.css';

const Article = ({post}) => {
    return (<article>
        <ArticleTitle title={post.title}/>
        <TableOfContents sections={post.sections}/>
        {post.sections.map(section => {return <Section section={section} key={section.id}/>})}
    </article>)
}

const ArticleTitle = ({title}) => {
    return <h2>{title}</h2>
}

const Section = ({section}) => {
    return <section>
        <h3 id={section.id}>{section.title}</h3>
        {section.fragments.map(fragment => {
            switch(fragment.type){
                case 'code': return <Code code={fragment.content} language={fragment.language}/>;
                case 'list': return <List content={fragment.content}/>
                case 'link': return <a className='articleLink' href={fragment.link}>{fragment.content}</a>
                default: return <p className='articleParagraph'>{fragment.content}</p>
            }
            })}
    </section>
}

Article.defaultProps = {
    post: {}
}

const List = ({content}) => (
    <ul className='articleList'>
        {content.map(item => (<li>{item}</li>))}
    </ul>
)

const TableOfContents = ({sections}) => (
    <section className="tableOfContents">
        <h3 className="title">Spis treści</h3>
        <ul className="list">
            {sections.map(section => (<a href={`#${section.id}`} className="item"><li>{section.title}</li></a>))}
        </ul>
    </section>
)

export default Article;