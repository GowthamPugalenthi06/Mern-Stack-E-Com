class APIFeatures {
    constructor(query,queryStr) {
        this.query = query;
        this.queryStr = queryStr;

        
    }
    search(){
        let keyword = this.queryStr.keyword ? {
            title:{
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        }:{};
        this.query.find({...keyword})
        return this;
    }
    filter(){
        const queryStrCopy = {...this.queryStr};
        const exclude = ['keyword','limit','page'];
        exclude.forEach(el=>delete queryStrCopy[el]);
        let queryStr = JSON.stringify(queryStrCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g,match => `$${match}`)
        this.query.find(JSON.parse(queryStr))
        
        return this;

    }
        paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1 ;
        const skip = resPerPage * (currentPage - 1)
        this.query.limit(resPerPage).skip(skip);
        return this;
    }
}
export default APIFeatures;