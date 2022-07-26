from flask_login import UserMixin
from werkzeug.security import check_password_hash

class User(UserMixin):
	def __init__(self, user):
		self.username = user.get("name")
		self.password = user.get("password")
		self.id = user.get("id")

	def verify_password(self, password):
		if self.password is None:
			return False
		return check_password_hash(self.password, password)

	def get_id(self):
		return self.id

	def get(user_id,user_list):
		if not user_id:
			return None
		for user in user_list:
			if user.get('id') == user_id:
				return User(user)
		return None