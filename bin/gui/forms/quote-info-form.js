
class QuoteInfoForm extends VHCforms{
  constructor(cont){
    super(cont);

  }

  qidom={
    inputs:{
      id:'form-quote-id',
      name:'form-quote-name',
      custid:'form-quote-custid',

      street:'form-quote-street',
      unit:'form-quote-unit',
      city:'form-quote-city',
      state:'form-quote-state',
      zip:'form-quote-zip',

      status:'form-quote-status',
      sold:'form-quote-sold',

      dept:'form-quote-dept',
      cat:'form-quote-cat',
      estimator:'form-quote-esitmator',

      opendate:'form-quote-opendate',
      lastdate:'form-quote-lastdate',
      subdate:'form-quote-subdate',
      apprdate:'form-quote-apprdate',
      closedate:'form-quote-closedate'
    }
  }

  contents=`
    <div>

    </div>
  `

}
