function create_box(world, x, y, width, height, options) 
{
	//default setting
	options = $.extend(true, {
		'density' : 1.0 ,
		'friction' : 1.0 ,
		'restitution' : 0.0 ,
		
		'linearDamping' : 0.0 ,
		'angularDamping' : 0.0 ,
		
		'gravityScale' : 1.0 ,
		'type' : b2Body.b2_dynamicBody , 
		
		'fixedRotation' : false ,
	}, options);
	
	var body_def = new b2BodyDef();
	var fix_def = new b2FixtureDef;
	
	fix_def.density = options.density;
	fix_def.friction = options.friction;
	fix_def.restitution = options.restitution;
	
	fix_def.shape = new b2PolygonShape();
	
	//user specific data
	fix_def.userData = options.userData;
	
	//important! this takes half the width
	fix_def.shape.SetAsBox( width /2 , height /2 );
	
	body_def.position.Set(x , y);
	body_def.linearDamping = options.linearDamping;
	body_def.angularDamping = options.angularDamping;
	
	body_def.type = options.type;
	body_def.fixedRotation = options.fixedRotation;
	
	var b = world.CreateBody( body_def );
	var f = b.CreateFixture(fix_def);
	
	return b;
}

function create_sphere(world, x, y, width, height, options){
	//default setting
	options = $.extend(true, {
		'density' : 1.0 ,
		'friction' : 10.0 ,
		'restitution' : 0.0 ,
		
		'linearDamping' : 0.0 ,
		'angularDamping' : 0.0 ,
		
		'gravityScale' : 1.0 ,
		'type' : b2Body.b2_dynamicBody , 
		
		'fixedRotation' : false ,
	}, options);
	
	var body_def = new b2BodyDef();
	var fix_def = new b2FixtureDef;
	
	fix_def.density = options.density;
	fix_def.friction = options.friction;
	fix_def.restitution = options.restitution;
	
	fix_def.shape = new b2PolygonShape();
	fix_def.shape.SetAsBox( width /2 , height /2 );
	
	//user specific data
	fix_def.userData = options.userData;

	body_def.position.Set(x , y);
	body_def.linearDamping = options.linearDamping;
	body_def.angularDamping = options.angularDamping;
	
	body_def.type = options.type;
	body_def.fixedRotation = options.fixedRotation;
	
	var b = world.CreateBody( body_def );
	var f = b.CreateFixture(fix_def);
	
	return b;	
}
