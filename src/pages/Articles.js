import "./Articles.css"
import Article from "../components/article/Article";
import article from "../articles/SpringBatch1";

const Articles = () => {
    return (<div className="articles">
        <div className="sideMenu">
            Side menu
        </div>
        <div className="article">
            <Article post={article}/>
        </div>
    </div>);
}

export default Articles;